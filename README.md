# Atomic Bastion / 原子堡垒

2D 射击游戏。玩家是代号「闸工」的技术执行员，隶属 ОТР-3，渗透第 72 号自动反应堆研究堡垒（铁脉）。铁脉核心遭中子辐照后，核动力自动化单元将所有人类判为入侵者。向 8 个方向射击，关停主机、回收记录，必要时销毁失控机械。  
Bastion（堡垒）强调据点防守与协同感，后续适合大房间、多据点的联机玩法。设定见 [docs/design/setting.md](docs/design/setting.md)。

一期工程只实现**单机纯前端网页**。联机与其余系统（货币、掉落、生命值等）待定。

## 玩法概要

| 项目 | 说明 |
| --- | --- |
| 类型 | 2D 射击 |
| 操控 | 单人或多人操控角色（一期仅单机） |
| 射击 | 上下左右 + 四个斜向，共 8 个方向 |
| 敌人 | 预计 3–5 种 |
| 武器 | 预计 5–10 种 |
| 其余系统 | 货币、掉落物、玩家 HP 等，待定 |

## 技术方向

本仓库为**前后端一体化**单体仓库。一期不启动后端，玩家拿到的是 `npm run build` 产出的静态网页。

- **包管理**：npm
- **前端**：Vite + TypeScript，Canvas 作为游戏本体
- **后端**：一期只保留目录，不实现服务逻辑
- **试玩分发**：把 `dist/` 交给玩家，用任意静态托管打开即可

## 本地开发

需要 [Node.js](https://nodejs.org/) 20 或以上。

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 `http://localhost:5173`）。

| 脚本 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器，带热更新 |
| `npm run build` | 打包为静态网页，输出到仓库根目录 `dist/` |

## 打包给玩家试玩

一期是**单机纯前端**，构建结果不依赖 Node 或任何后端。

```bash
npm run build
```

将整个 `dist/` 目录发给玩家（可打成 zip）。用任意静态网站托管打开，例如 GitHub Pages、Netlify，或本机：

```bash
npx --yes serve dist
```

不要直接双击 `dist/index.html`：打包后的 ES 模块在 `file://` 下通常无法运行。

## 图像资源

图像分两个目录，不要混放。

| 目录 | 用途 | 是否发给玩家 |
| --- | --- | --- |
| [`assets/`](assets/) | **草稿**：概念图、AI 稿、PSD、未切片原图 | 否，不进 `dist/` |
| [`client/public/img/`](client/public/img/) | **正式图**：游戏实际加载的 PNG 等 | 是，`npm run build` 后出现在 `dist/img/` |

选用 `img` 而不是 `assets` / `static` / `source`：

- 仓库根目录已经占用 `assets/` 表示草稿
- Vite 打包出的 JS/CSS 在 `dist/assets/`，与游戏图不是一回事
- `client/public/` 下的文件会原样拷到 `dist/`，Canvas 用相对路径 `./img/...` 即可加载（配合 `base: './'`）

玩家、武器与机械鬣狗不再加载位图：用 **WebGL 正交方块模型** 在运行时烘焙八向图（45° 俯视、无透视），武器图层按朝向叠到手上。预览 / 导出：开发时打开 `http://127.0.0.1:5173/tools/player-sheet.html`。

其它图像仍按「草稿 → 正式图」：在 `assets/` 里画 / 生成 → 切出游戏用图 → 放入 `client/public/img/`。代码不要引用 `assets/`。

## 目录结构

```
atomic-bastion/
├── package.json            # npm 脚本：dev / build
├── vite.config.ts          # Vite：开发服务器与静态打包
├── dist/                   # npm run build 产物（不入库）
├── client/                 # 前端：Canvas 游戏本体
│   ├── index.html          # 页面入口
│   ├── tools/              # WebGL 八向图预览（仅开发）
│   ├── public/
│   │   └── img/            # 其它正式图像（构建后 → dist/img/）
│   └── src/
│       ├── render/         # WebGL 正交模型 / 烘焙八向图
│       ├── game/           # 主循环、相机、世界
│       ├── entities/       # 玩家、敌人、子弹等实体
│       ├── weapons/        # 武器与弹道
│       ├── systems/        # 输入、碰撞、生成、渲染
│       ├── scenes/         # 场景 / 关卡
│       └── ui/             # HUD、菜单
├── server/                 # 后端（一期仅目录，无实现）
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── models/
│       ├── middleware/
│       └── config/
├── shared/                 # 前后端共享的常量与类型
│   └── src/
│       ├── constants/
│       └── types/
├── assets/                 # 图像 / 音频草稿（不打包）
│   ├── sprites/
│   ├── tiles/
│   ├── ui/
│   └── audio/
└── docs/                   # 设计与工程文档
    ├── design/             # 游戏设计
    ├── todo/               # 任务与一期范围
    ├── art/                # 美术规范与资源清单
    ├── db/                 # 数据库设计
    ├── api/                # 接口设计（二期联机）
    └── architecture/       # 技术架构
```

## 文档

| 目录 | 内容 |
| --- | --- |
| [docs/design](docs/design/) | 世界观、玩法、战斗、敌人、武器 |
| [docs/todo](docs/todo/) | 一期任务与待决事项 |
| [docs/art](docs/art/) | 美术风格与资源清单 |
| [docs/db](docs/db/) | 数据存储设计 |
| [docs/api](docs/api/) | 联机接口（后续） |
| [docs/architecture](docs/architecture/) | 前后端与 Canvas 架构 |

## 开发状态

进入网页后先到菜单。「开始游戏」进入生存模式：有限场地，WASD 八向移动，空格沿朝向射击（手枪点射、冲锋枪连发），`1`–`4` 切枪。Esc 暂停；J 补给舱、K 武器柜、L 任务单。补给舱、任务单与存档尚未开放。
