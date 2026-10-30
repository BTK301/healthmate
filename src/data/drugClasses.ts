import type { DrugClass } from "./drugs";

export interface ClassInfo {
  label: string;
  /** what the class is normally used for — general, guideline level */
  usedFor: string;
  /** one practical caution shown under the drug */
  note: string;
}

/**
 * Class-level reference text. Kept deliberately general (what the group is used
 * for + one common practical caution) so the app never pretends to be a
 * patient information leaflet. Drug-specific claims stay in `interaction_rules`,
 * which carry evidence levels and citations.
 */
export const CLASS_INFO: Record<DrugClass, ClassInfo> = {
  nsaid: {
    label: "Kháng viêm không steroid",
    usedFor: "Giảm đau, hạ sốt, kháng viêm",
    note: "Nên uống sau ăn; nhóm này có thể làm tăng huyết áp và gây khó chịu dạ dày.",
  },
  antiplatelet: {
    label: "Chống kết tập tiểu cầu",
    usedFor: "Dự phòng huyết khối, nhồi máu cơ tim, đột quỵ",
    note: "Dễ bầm tím; báo bác sĩ nếu chảy máu kéo dài.",
  },
  acei: {
    label: "Ức chế men chuyển",
    usedFor: "Hạ huyết áp, bảo vệ tim và thận",
    note: "Có thể gây ho khan; cần theo dõi kali máu.",
  },
  arb: {
    label: "Chẹn thụ thể angiotensin II",
    usedFor: "Hạ huyết áp, bảo vệ tim và thận",
    note: "Cần theo dõi kali máu, đặc biệt khi thận yếu.",
  },
  "beta-blocker": {
    label: "Chẹn beta",
    usedFor: "Hạ huyết áp, kiểm soát nhịp tim",
    note: "Không ngừng đột ngột — có thể làm nhịp tim tăng vọt.",
  },
  ccb: {
    label: "Chẹn kênh canxi",
    usedFor: "Hạ huyết áp, giãn mạch",
    note: "Có thể gây phù nhẹ ở chân.",
  },
  "loop-diuretic": {
    label: "Lợi tiểu quai",
    usedFor: "Giảm phù, hạ huyết áp",
    note: "Nên uống buổi sáng; làm mất kali qua nước tiểu.",
  },
  thiazide: {
    label: "Lợi tiểu thiazide",
    usedFor: "Hạ huyết áp",
    note: "Có thể làm giảm kali và tăng nhẹ đường huyết.",
  },
  "potassium-sparing": {
    label: "Lợi tiểu giữ kali",
    usedFor: "Giảm phù, hỗ trợ điều trị suy tim",
    note: "Tránh ăn nhiều thực phẩm giàu kali.",
  },
  statin: {
    label: "Statin",
    usedFor: "Hạ cholesterol máu",
    note: "Tránh bưởi; báo bác sĩ nếu đau cơ không rõ nguyên nhân.",
  },
  biguanide: {
    label: "Biguanide",
    usedFor: "Kiểm soát đường huyết tuýp 2",
    note: "Uống cùng bữa ăn để giảm khó chịu dạ dày; tránh rượu.",
  },
  sulfonylurea: {
    label: "Sulfonylurea",
    usedFor: "Hạ đường huyết tuýp 2",
    note: "Có nguy cơ hạ đường huyết nếu bỏ bữa.",
  },
  thyroid: {
    label: "Hormone tuyến giáp",
    usedFor: "Điều trị suy giáp",
    note: "Uống lúc đói, cách xa canxi, sắt và cà phê.",
  },
  anticoagulant: {
    label: "Chống đông máu",
    usedFor: "Dự phòng và điều trị huyết khối",
    note: "Giữ lượng rau xanh ổn định; tránh rượu bia.",
  },
  ppi: {
    label: "Ức chế bơm proton",
    usedFor: "Giảm tiết acid dạ dày, viêm loét, trào ngược",
    note: "Uống trước bữa ăn khoảng 30 phút.",
  },
  corticosteroid: {
    label: "Corticoid",
    usedFor: "Kháng viêm, chống dị ứng, bệnh tự miễn",
    note: "Giữ muối và đường ở mức thấp; không ngừng đột ngột.",
  },
  fluoroquinolone: {
    label: "Kháng sinh quinolone",
    usedFor: "Nhiễm khuẩn đường tiết niệu, hô hấp",
    note: "Cách sữa và canxi ít nhất 2 giờ.",
  },
  tetracycline: {
    label: "Kháng sinh tetracycline",
    usedFor: "Nhiễm khuẩn da, hô hấp",
    note: "Cách sữa và canxi ít nhất 2 giờ; tránh nắng gắt.",
  },
  "urate-lowering": {
    label: "Hạ acid uric",
    usedFor: "Dự phòng cơn gout",
    note: "Uống đủ nước trong ngày.",
  },
  bronchodilator: {
    label: "Giãn phế quản",
    usedFor: "Hen phế quản, COPD",
    note: "Cần dùng đúng kỹ thuật hít để thuốc vào phổi.",
  },
  penicillin: {
    label: "Kháng sinh penicillin",
    usedFor: "Nhiễm khuẩn thông thường",
    note: "Uống đủ liệu trình, kể cả khi đã thấy đỡ.",
  },
};

export function classInfoFor(classes: DrugClass[]): ClassInfo[] {
  return classes.map((c) => CLASS_INFO[c]).filter(Boolean);
}
