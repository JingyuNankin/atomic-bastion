# 前端（client）

Canvas 游戏本体。一期在此实现单机玩法。

```
client/
├── public/          # 页面入口、favicon 等
└── src/
    ├── game/        # 主循环、相机、世界
    ├── entities/    # 玩家、敌人、子弹
    ├── weapons/     # 武器定义与开火
    ├── systems/     # 输入、碰撞、生成、渲染
    ├── scenes/      # 场景 / 关卡
    └── ui/          # HUD、暂停、结算菜单
```

技术栈（Canvas 以外的语言、打包、框架）待定。本目录暂不包含可运行代码。
