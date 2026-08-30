【点亮星空｜公网活动版】

这个版本不依赖活动现场电脑，不需要同一 Wi-Fi。
手机扫码直接访问公网网址；星星数量保存在 Supabase 云数据库。

需要：
1. GitHub 账号
2. Vercel 账号
3. Supabase 账号

一、Supabase
1. 新建项目。
2. 打开 SQL Editor。
3. 把本文件夹里的 supabase.sql 全部粘贴执行。
4. Project Settings → API，记下 Project URL 和 service_role key。

二、GitHub
新建一个仓库，把本项目全部文件上传。
不要把 .env 或 service_role key 上传 GitHub。

三、Vercel
1. 登录 Vercel。
2. Add New → Project。
3. Import 你的 GitHub 仓库。
4. 部署。
5. Settings → Environment Variables 增加：
   SUPABASE_URL = 你的 Supabase Project URL
   SUPABASE_SERVICE_ROLE_KEY = 你的 service_role key
   ADMIN_KEY = 自己设置的后台密码
6. 重新 Deploy。

四、网址
Vercel 会给你：
https://你的项目.vercel.app

这个就是二维码内容。
二维码固定不变。

五、视频
把视频文件放到：
public/video.mp4

建议 MP4(H.264/AAC)，不要太大。若视频很大，建议把视频放到对象存储/CDN，再修改 index.html 的视频地址。

六、后台
https://你的项目.vercel.app/admin.html
输入 ADMIN_KEY。
可以修改当前星星、目标数量、重置。

七、活动流程
活动前：
后台把星星设成 0（或你需要的初始值）。
设置目标，例如 500。
手机扫码测试一次，确认 +1。
确认视频能播放。

活动中：
参与者直接扫固定二维码。
每次成功进入主页会 +1。
视频按钮始终可以手动播放。
达到目标时网页会触发星光爆发。

重要：
当前逻辑是“打开活动主页一次就 +1”。同一个人刷新页面也会再 +1。
如果你需要严格做到“一个人只能算一次”，下一版可以加扫码票据/设备会话/活动邀请码等规则。
