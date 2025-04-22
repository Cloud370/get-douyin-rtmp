const AnyProxy = require("anyproxy");
const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs");
const os = require("os");

const PROXY_PORT = process.env.PROXY_PORT || 7982;

const rtmpConfigPath = path.join(os.homedir(), "live.txt");

function enableProxy() {
  return AnyProxy.utils.systemProxyMgr.enableGlobalProxy(
    "127.0.0.1",
    PROXY_PORT
  );
}

function disableProxy() {
  return AnyProxy.utils.systemProxyMgr.disableGlobalProxy();
}

function installCA() {
  return new Promise((resolve, reject) => {
    if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
      AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
        if (!error) {
          const cwd = path.dirname(keyPath);
          console.clear();
          console.log(`
  1.点击【安装证书】
  2.选择【本地计算机】并单击下一步
  3.选择【将所有的证书都放入下列存储(P)】-> 点击【浏览】
  4.选中第二个【受信任的根证书颁发机构】-> 点击【确定】-> 选择【下一步】
  5.选择【完成】-> 点击【确定】-> 点击【确定】
  完成上述步骤之后请输入回车！
          `);
          exec("start rootCA.crt", { cwd });
          process.stdin.once("data", resolve);
        } else {
          console.error("生成证书错误");
          reject(error);
        }
      });
    } else {
      resolve("已安装");
    }
  });
}

installCA().then(() => {
  console.clear();
  enableProxy();
  const rule = {
    summary: "检测抖音主播伴侣开播",
    async beforeSendResponse(req, res) {
      if (req.url.includes("/webcast/room/create/")) {
        const body = JSON.parse(res.response.body);
        const baseUrl = body.data.stream_url.rtmp_push_url;
        const rtmpSecret = baseUrl.split("/").pop();
        const rtmpServer = baseUrl.split(rtmpSecret)[0];
        console.clear();
        const content = `
  服务器:  ${rtmpServer}
串流密钥:  ${rtmpSecret}
        `;
        fs.writeFileSync(rtmpConfigPath, content, {
          encoding: "utf8",
        });

        //打开记事本方便点
        exec(`start ${rtmpConfigPath}`);

        console.log(`
${content}
        【在OBS中输入服务器和串流密钥并且应用设置之后请在下方输入回车】
        `);

        process.stdin.once("data", () => {
          exec("taskkill /f /t /im 直播伴侣.exe", () => {});
          console.log(`请点击OBS中的 【开始推流】`);
          disableProxy();
          if (fs.existsSync(rtmpConfigPath)) {
            fs.rmSync(rtmpConfigPath);
          }
          console.log(`已完成，按任意键退出本软件！`);
          process.stdin.once("data", () => {
            process.exit(0);
          });
        });
      }
      return null;
    },
  };
  const options = {
    rule,
    port: PROXY_PORT,
    silent: true,
    webInterface: {
      enable: false,
    },
    forceProxyHttps: true,
    dangerouslyIgnoreUnauthorized: true,
  };

  const proxyServer = new AnyProxy.ProxyServer(options);

  proxyServer.on("ready", () => {
    console.log("软件准备就绪，请启动【直播伴侣】并且点击【开始直播】");
  });

  proxyServer.start();
});
