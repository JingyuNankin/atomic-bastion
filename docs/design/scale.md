# 单位与地图

长度和速度用同一种**单位**。代码里 1 单位固定等于 16 CSS 像素（`PX_PER_UNIT`）。窗口变大或变小，这个比例不变：地图不拉伸，也不跟着屏幕长出一块。

窗口比地图大时，地图居中，多出来的是舱壁。窗口比地图小时，镜头跟着人，只看见地图的一块。没有无限地图。以后每张地图单独写宽和高，单位不变。

## 当前试玩舱

| 量 | 值 |
| --- | --- |
| 地图 | 80 × 45 单位（1280 × 720 CSS 像素） |
| 执行员身高 | 6 单位 |
| 执行员足底碰撞 | 1.5 × 1.5 单位的正方形，整块留在地图内 |
| 执行员移速 | 12.5 单位/秒 |
| 地面分格 | 3 单位 |

常量在 `client/src/game/units.ts` 与 `client/src/game/map.ts`。设计表里的长度、速度写单位；目录加载时乘 16，战斗内部仍用 CSS 像素。

用单位的字段：身高、移速、敌人的速度与距离（`speed`、`cruiseSpeed`、`attackRange`、`attackReach`、`attackKnockback`、`blastRadius`、`hitRadius`、`hitLift`、`bodyRadius`）、武器的 `projectileSpeed`、`knockback`、`range`、`blastRadius`、地图宽高。

不换算的：秒、伤害、角度、比率、弹匣发数。弹体的 `drawWidth` / `drawHeight` 是贴图像素，不是世界长度。
