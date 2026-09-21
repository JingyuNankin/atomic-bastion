# 数据结构草案

一期可不实现。单机若需要存档，可先用本地文件 / `localStorage`，字段尽量与下表对齐，便于以后迁到服务端。

## 候选实体

| 实体 | 用途 | 一期 |
| --- | --- | --- |
| User | 账号 | 不做 |
| Save | 单机进度 | 可选 |
| WeaponDef | 武器配置 | 可用静态配置代替 |
| EnemyDef | 敌人配置 | 可用静态配置代替 |
| Run / Match | 对局记录 | 不做 |
| Loadout | 出战武器 | 待定 |

## Save（若做本地存档）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 存档 ID |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |
| stageId | string | 当前场景 |
| player | object | 位置、朝向、武器等 |
| inventory | object | 待定 |
| flags | object | 进度标记 |

具体类型与约束待系统确定后再写正式 schema。
