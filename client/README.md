# 前端（client）

Canvas 游戏本体。一期在此实现单机玩法。用仓库根目录的 npm 脚本启动与打包：

```bash
npm run dev      # 开发服务器
npm run build    # 静态网页 → ../dist/
```

```
client/
├── index.html       # Vite 入口
├── public/          # favicon 等不经打包的资源
└── src/
    ├── main.ts      # 启动入口
    ├── game/        # 主循环、相机、世界
    ├── entities/    # 玩家、敌人、子弹
    ├── weapons/     # 武器定义与开火
    ├── systems/     # 输入、碰撞、生成、渲染
    ├── scenes/      # 场景 / 关卡
    └── ui/          # HUD、暂停、结算菜单
```

技术栈：TypeScript + Vite，游戏绘制在 Canvas 上。不使用游戏引擎框架。
