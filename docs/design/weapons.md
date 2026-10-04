# 武器

一期先做 **2 种**：手枪与冲锋枪。角色图不重绘，武器图层按朝向叠在手上。数值与弹体索引以 [weapons.json](weapons.json) 为准。

| ID | 名称 | 定位 | 状态 |
| --- | --- | --- | --- |
| w01-pistol | 手枪 | 精确半自动，开局配枪 | 已填数值 |
| w02-smg | 冲锋枪 | 高射速压制 | 已填数值 |
| W03–W10 | TBD | 后续 | 未开放 |

## 手枪

工厂区常见的制式侧武器。单发清楚、后坐可控，适合点射与补枪。弹匣小，容错低。

- 射速低，单发威力高
- 散布小，适合打准
- 生存模式默认携带

## 冲锋枪

从废弃车间拼出来的连发枪。弹幕密、压枪难，用来清近身潮。单发弱，空弹匣换弹慢。

- 射速高，单发威力低
- 散布大，适合近距覆盖
- 按 `2` 切换（`1` 回手枪）
- 按住空格连发

## 弹体索引

武器用 `projectileId` 指向 `projectiles[]`，后续激光枪、霰弹枪、火箭筒只需加弹体条目并改武器引用。

| ID | 名称 | style | 使用 |
| --- | --- | --- | --- |
| proj-pistol-slug | 手枪弹 | slug | 手枪 |
| proj-smg-slug | 冲锋枪弹 | slug | 冲锋枪 |
| proj-laser-beam | 激光束 | beam | 预留 |
| proj-buckshot | 霰弹 | pellet | 预留 |
| proj-rocket | 火箭弹 | rocket | 预留 |

## 数值字段

| 字段 | 含义 | 单位 |
| --- | --- | --- |
| fireMode | 射击模式 | semi 点射 / auto 连发 |
| projectileId | 弹体索引 | 对应 projectiles.id |
| fireRate | 射速 | 发 / 秒 |
| magazineSize | 弹匣容量 | 发 |
| damage | 单发威力 | 伤害点 |
| reloadTime | 换弹时间 | 秒 |
| projectileSpeed | 弹速 | 像素 / 秒 |
| knockback | 击退 | 待定标尺 |
| spread | 散布 | 度 |
| penetration | 穿透目标数 | 0 为不穿透 |
| projectileCount | 单次射出数量 | 发 |

实现目录：`client/src/weapons/`。美术与角色共用 WebGL 正交烘焙。空格射击：手枪点射、冲锋枪连发；弹空自动装填。
