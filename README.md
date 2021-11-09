# get-douyin-rtmp🔐
抖音[直播伴侣]推流密钥获取工具

### 大概思路
通过中间人代理获取开播返回的rtmp地址

### 实现流程
1. 用户安装CA证书
2. 启动代理服务器
3. 检测到开播
4. 解析得出RTMP地址
5. 强制结束直播伴侣(不能点断开)
6. OBS介入推流
7. 关闭代理服务器
8. 退出本进程

## 注意事项
要关直播请再次运行直播伴侣 点 继续直播 然后再关闭直播 否则就算不推流了也不会立刻下播（懒得写下播了）

### 感谢
- [anyproxy](https://github.com/alibaba/anyproxy)
- [nexe](https://github.com/nexe/nexe)