import asyncio, sys, json, threading, functools, http.server, socketserver
from playwright.async_api import async_playwright
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory='/home/claude/dynox-viewer')); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
jobs=json.load(open('/home/claude/manual/figjobs.json')); routes=json.load(open('/home/claude/manual/routes.json'))
models=sys.argv[1].split(','); only=sys.argv[2].split(',') if len(sys.argv)>2 else None
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        proj={}
        for m in models:
            pg=await b.new_page(viewport={'width':1600,'height':1100},reduced_motion='reduce',device_scale_factor=1)
            pg.on('pageerror',lambda x: print('ERR',x))
            await pg.goto(f'http://127.0.0.1:{port}/index.html?model={m}')
            await pg.wait_for_function('document.getElementById("loading").classList.contains("done")',timeout=180000)
            await pg.evaluate("document.querySelector('button[data-bg=white]').click()")
            await pg.evaluate('__rts.setCaptureMode(true)')
            for j in jobs[m]:
                if only and j['name'] not in only: continue
                await pg.evaluate('(o)=>__rts.capture(o)',j)
                await pg.wait_for_timeout(1200)
                await pg.evaluate('(o)=>__rts.capture(o)',j)
                await pg.wait_for_timeout(1500)
                await pg.screenshot(path=f'/home/claude/manual/fig/{m}_{j["name"]}.png',timeout=180000)
            await pg.close()
        await b.close()
        old={}
        try: old=json.load(open('/home/claude/manual/routeproj.json'))
        except Exception: pass
        old.update(proj); json.dump(old,open('/home/claude/manual/routeproj.json','w'))
asyncio.run(main())
