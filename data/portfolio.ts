// 设定支持的最大图片数量上限（根据需求可自由调大，比如 200 或 500）
const MAX_PHOTOS = 200;

export const PORTFOLIO_IMAGES = Array.from({ length: MAX_PHOTOS }, (_, i) => {
  const num = i + 1;
  // 保持原有编号命名规范（如 01.jpg, 02.jpg ... 078.jpg, 079.jpg, 0100.jpg）
  const formattedNum = num < 10 ? `0${num}` : `0${num}`;
  return `/images/work/${formattedNum}.jpg`;
});