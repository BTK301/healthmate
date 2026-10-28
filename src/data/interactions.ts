import type { Rule } from "@/core/rules/types";
import { drugs } from "@/data/drugs";
import { recipes } from "@/data/recipes";
import { tagsOf } from "@/core/nutrition/macros";

/**
 * Curated drug–food / condition–food rules.
 * Evidence: A = guideline, B = good clinical data, C = limited, D = traditional.
 * Every rule must carry a citation — no unsourced medical claims.
 */
export const rules: Rule[] = [
  {
    id: "nsaid-raises-bp",
    title: "Thuốc giảm đau kháng viêm có thể làm tăng huyết áp",
    severity: "warning",
    evidence: "B",
    when: { drugClasses: ["nsaid"] },
    effect: {
      sodiumMgMax: 1500,
      excludeTags: ["alcohol"],
      advice:
        "Nhóm NSAID giữ muối và nước, có thể đẩy huyết áp lên. Giữ natri dưới 1.500 mg/ngày (khoảng 4 g muối) và bỏ rượu bia trong thời gian dùng thuốc.",
      lifestyle: [
        "Đo huyết áp 2 lần mỗi tuần và ghi lại",
        "Đi bộ nhanh 30 phút mỗi ngày",
        "Tránh nâng tạ nặng và nín thở khi gắng sức",
        "Hạn chế cà phê dưới 2 ly/ngày",
      ],
      citation: "Dược thư Quốc gia Việt Nam; EMA NSAID cardiovascular safety review",
    },
  },
  {
    id: "acei-arb-potassium",
    title: "Ức chế men chuyển giữ kali — cần chú ý khi thận yếu",
    severity: "warning",
    evidence: "B",
    when: { drugClasses: ["acei", "arb"], requiresConditionIds: ["ckd_mild"] },
    effect: {
      sodiumMgMax: 1500,
      excludeTags: ["high-potassium"],
      advice:
        "ACEI/ARB làm tăng kali máu, và suy thận làm tình trạng này nặng hơn. Tạm hạn chế chuối, cam và khoai tây với khẩu phần lớn.",
      lifestyle: ["Xét nghiệm kali máu theo lịch hẹn", "Không tự dùng thêm viên kali"],
      citation: "KDIGO 2021 Blood Pressure Guideline",
    },
  },
  {
    id: "spironolactone-potassium",
    title: "Lợi tiểu giữ kali — kiểm soát thực phẩm giàu kali",
    severity: "warning",
    evidence: "B",
    when: { drugClasses: ["potassium-sparing"] },
    effect: {
      excludeTags: ["high-potassium"],
      advice:
        "Spironolactone giữ kali lại trong cơ thể. Nên giảm các món giàu kali như chuối, cam, khoai tây và nước dừa.",
      lifestyle: ["Theo dõi kali máu định kỳ"],
      citation: "Dược thư Quốc gia Việt Nam",
    },
  },
  {
    id: "warfarin-vitamin-k",
    title: "Warfarin — giữ lượng rau xanh ổn định",
    severity: "caution",
    evidence: "A",
    when: { drugClasses: ["anticoagulant"] },
    effect: {
      excludeTags: ["alcohol"],
      advice:
        "Không cần kiêng rau xanh, nhưng phải ăn đều mỗi ngày. Thay đổi đột ngột lượng rau muống, cải, rau ngót sẽ làm INR dao động.",
      lifestyle: [
        "Giữ khẩu phần rau xanh tương đương giữa các ngày",
        "Tránh rượu bia",
        "Xét nghiệm INR theo chỉ định",
      ],
      citation: "Dược thư Quốc gia Việt Nam; ACCP Antithrombotic Guideline",
    },
  },
  {
    id: "levothyroxine-timing",
    title: "Levothyroxine — uống lúc đói, cách xa bữa ăn",
    severity: "info",
    evidence: "A",
    when: { drugClasses: ["thyroid"] },
    effect: {
      advice:
        "Uống thuốc khi bụng đói, trước bữa sáng 30–60 phút. Canxi, sắt, sữa và cà phê làm giảm hấp thu — cần cách ít nhất 4 giờ.",
      lifestyle: ["Uống cùng nước lọc, không uống cùng sữa hoặc cà phê"],
      citation: "ATA 2014 Guidelines for Hypothyroidism",
    },
  },
  {
    id: "antibiotic-minerals",
    title: "Kháng sinh nhóm quinolone/tetracycline kỵ canxi",
    severity: "warning",
    evidence: "A",
    when: { drugClasses: ["fluoroquinolone", "tetracycline"] },
    effect: {
      advice:
        "Sữa, sữa chua và viên canxi tạo phức với thuốc, làm giảm hấp thu. Uống thuốc cách các món này ít nhất 2 giờ.",
      lifestyle: ["Uống đủ nước trong thời gian dùng kháng sinh"],
      citation: "Dược thư Quốc gia Việt Nam — tương tác thuốc",
    },
  },
  {
    id: "statin-grapefruit",
    title: "Statin — tránh bưởi và nước bưởi",
    severity: "caution",
    evidence: "A",
    when: { drugClasses: ["statin"] },
    effect: {
      advice:
        "Bưởi ức chế enzyme CYP3A4, làm nồng độ simvastatin và atorvastatin trong máu tăng, dễ gây đau cơ.",
      lifestyle: ["Báo bác sĩ nếu đau cơ không rõ nguyên nhân"],
      citation: "FDA Drug Safety Communication — grapefruit and statins",
    },
  },
  {
    id: "metformin-alcohol",
    title: "Metformin — hạn chế rượu bia",
    severity: "warning",
    evidence: "B",
    when: { drugClasses: ["biguanide"] },
    effect: {
      excludeTags: ["alcohol"],
      advice:
        "Rượu làm tăng nguy cơ nhiễm toan lactic khi dùng metformin. Nên bỏ hoàn toàn trong thời gian điều trị.",
      lifestyle: ["Uống thuốc cùng bữa ăn để giảm khó chịu dạ dày"],
      citation: "Dược thư Quốc gia Việt Nam",
    },
  },
  {
    id: "steroid-sodium-sugar",
    title: "Corticoid — giảm muối và đường",
    severity: "warning",
    evidence: "B",
    when: { drugClasses: ["corticosteroid"] },
    effect: {
      sodiumMgMax: 1500,
      excludeTags: ["added-sugar"],
      advice:
        "Prednisolone gây giữ nước, tăng huyết áp và tăng đường huyết. Giảm muối, bỏ nước ngọt, ưu tiên đạm nạc và rau.",
      lifestyle: [
        "Bổ sung canxi và vitamin D theo tư vấn",
        "Theo dõi đường huyết nếu dùng kéo dài",
      ],
      citation: "Dược thư Quốc gia Việt Nam",
    },
  },
  {
    id: "diuretic-potassium-loss",
    title: "Lợi tiểu — bù thực phẩm giàu kali",
    severity: "caution",
    evidence: "B",
    when: { drugClasses: ["loop-diuretic", "thiazide"] },
    effect: {
      preferTags: ["high-potassium"],
      advice:
        "Furosemide và hydrochlorothiazide làm mất kali qua nước tiểu. Rau xanh, chuối và khoai tây giúp bù lại — trừ khi bạn có bệnh thận.",
      lifestyle: ["Uống nước đều trong ngày", "Chú ý chuột rút, mệt mỏi bất thường"],
      citation: "Dược thư Quốc gia Việt Nam",
    },
  },
  {
    id: "gout-purine",
    title: "Gout — giảm đạm purin",
    severity: "warning",
    evidence: "B",
    when: { conditionIds: ["gout"] },
    effect: {
      excludeTags: ["high-purine"],
      advice:
        "Hạn chế hải sản, thịt đỏ, nội tạng và bia. Uống 2–2,5 lít nước mỗi ngày giúp đào thải acid uric.",
      lifestyle: ["Tránh bia và rượu mạnh", "Giữ cân nặng ổn định, giảm cân từ từ"],
      citation: "ACR 2020 Guideline for Gout Management",
    },
  },
  {
    id: "hypertension-sodium",
    title: "Tăng huyết áp — natri dưới 1.500 mg/ngày",
    severity: "warning",
    evidence: "A",
    when: { conditionIds: ["hypertension"] },
    effect: {
      sodiumMgMax: 1500,
      excludeTags: ["alcohol"],
      advice:
        "Người Việt thường ăn 3.000–4.000 mg natri mỗi ngày, phần lớn từ nước mắm. Giảm còn dưới 1.500 mg là can thiệp hiệu quả nhất.",
      lifestyle: [
        "Bỏ nước mắm pha, dùng nước mắm nhạt hoặc chanh ớt thay thế",
        "Đi bộ 30 phút, 5 ngày mỗi tuần",
        "Đo huyết áp tại nhà và ghi lại",
      ],
      citation: "Bộ Y tế Việt Nam — Hướng dẫn chẩn đoán và điều trị tăng huyết áp",
    },
  },
  {
    id: "diabetes-added-sugar",
    title: "Đái tháo đường — kiểm soát đường thêm vào",
    severity: "warning",
    evidence: "A",
    when: { conditionIds: ["diabetes_t2"] },
    effect: {
      excludeTags: ["added-sugar"],
      advice:
        "Bỏ nước ngọt và đường thêm là thay đổi đơn giản nhưng hiệu quả nhất. Ưu tiên tinh bột có chất xơ như cơm gạo lứt.",
      lifestyle: ["Đi bộ 10–15 phút sau bữa ăn", "Theo dõi đường huyết theo lịch"],
      citation: "ADA Standards of Care 2024",
    },
  },
  {
    id: "gastritis-irritants",
    title: "Dạ dày — tránh đồ cay, rượu và caffeine",
    severity: "caution",
    evidence: "B",
    when: { conditionIds: ["gastritis"] },
    effect: {
      excludeTags: ["spicy", "alcohol", "caffeine"],
      advice:
        "Đồ cay, rượu và cà phê làm tăng tiết acid và kích ứng niêm mạc. Chia nhỏ bữa và không ăn quá no buổi tối.",
      lifestyle: ["Không nằm ngay sau khi ăn", "Ăn tối trước giờ ngủ ít nhất 2 giờ"],
      citation: "Dược thư Quốc gia Việt Nam",
    },
  },
  {
    id: "ckd-mild-potassium",
    title: "Suy thận nhẹ — hạn chế kali và đạm",
    severity: "warning",
    evidence: "B",
    when: { conditionIds: ["ckd_mild"] },
    effect: {
      excludeTags: ["high-potassium"],
      advice:
        "Khi chức năng thận giảm, kali và đạm khó đào thải hơn. Trao đổi với bác sĩ về mức đạm phù hợp trước khi tăng đạm để tập luyện.",
      lifestyle: ["Không tự dùng thực phẩm bổ sung kali hoặc đạm"],
      citation: "KDIGO 2020 Nutrition Guideline",
    },
  },
  {
    id: "dyslipidemia-fried",
    title: "Mỡ máu cao — giảm đồ chiên và mỡ động vật",
    severity: "caution",
    evidence: "A",
    when: { conditionIds: ["dyslipidemia"] },
    effect: {
      excludeTags: ["fried"],
      advice:
        "Ưu tiên hấp, luộc, áp chảo. Thay mỡ động vật bằng dầu thực vật và tăng rau, đậu, cá.",
      lifestyle: ["Tăng chất xơ hoà tan: yến mạch, đậu", "Vận động 150 phút mỗi tuần"],
      citation: "ESC/EAS 2019 Dyslipidaemia Guidelines",
    },
  },
  {
    id: "anemia-iron",
    title: "Thiếu máu — tăng sắt và vitamin C",
    severity: "info",
    evidence: "B",
    when: { conditionIds: ["anemia"] },
    effect: {
      advice:
        "Ăn thịt đỏ, gan, đậu và rau lá xanh cùng nguồn vitamin C để hấp thu sắt tốt hơn. Trà và cà phê ngay sau bữa làm giảm hấp thu.",
      lifestyle: ["Cách trà/cà phê ít nhất 1 giờ sau bữa ăn"],
      citation: "WHO Guideline on iron supplementation",
    },
  },
];

/** Precompute tags per recipe so the planner can filter quickly. */
export const recipeTags = new Map(recipes.map((r) => [r.id, tagsOf(r)]));

export const drugClassIndex = new Map(
  drugs.map((d) => [d.id, new Set(d.classes)]),
);
