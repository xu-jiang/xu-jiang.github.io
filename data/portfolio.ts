// 设定支持的最大图片数量上限
const MAX_PHOTOS = 200;

export const PORTFOLIO_IMAGES = Array.from({ length: MAX_PHOTOS }, (_, i) => {
  const num = i + 1;
  
  // 1. 如果你的图片命名规则是：1-9 补 0（01.jpg），10 及以上保持原样（10.jpg ... 100.jpg）
  const formattedNum = num < 10 ? `0${num}` : `${num}`;

  // 2. 如果你的图片命名规则是严格固定 3 位数（001.jpg, 010.jpg, 100.jpg）
  // const formattedNum = String(num).padStart(3, "0");

  return `/images/work/${formattedNum}.jpg`;
});