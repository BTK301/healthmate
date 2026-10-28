/** Human labels for food tags shown in the UI. */
export const TAG_LABEL: Record<string, string> = {
  alcohol: "rượu bia",
  "high-sodium": "đồ mặn",
  "high-potassium": "thực phẩm giàu kali",
  "high-purine": "đạm purin cao",
  "added-sugar": "đường thêm",
  "high-sugar": "đồ ngọt",
  spicy: "đồ cay",
  caffeine: "caffeine",
  fried: "đồ chiên",
  dairy: "sữa",
  processed: "đồ chế biến sẵn",
  "high-fat": "đồ nhiều béo",
  "vitamin-k": "rau giàu vitamin K",
  calcium: "canxi",
};

export function tagLabel(tag: string) {
  return TAG_LABEL[tag] ?? tag.replace(/-/g, " ");
}
