// CaloScanAi PDF 報告產生器 - 六種格式
import jsPDF from 'jspdf';

// 工具函式
const safeNum = (n) => n == null ? 0 : (isNaN(n) ? 0 : Number(n));
const safeDate = (d) => d == null ? '' : String(d);

// 取得本地日期字串
function getLocalDateStr(date) {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const taiwan = new Date(utc + (8 * 60 * 60 * 1000));
  const y = taiwan.getFullYear();
  const m = String(taiwan.getMonth() + 1).padStart(2, '0');
  const day = String(taiwan.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 計算統計
function calcStats(records) {
  const totalCal = records.reduce((sum, r) => sum + safeNum(r.total_calories), 0);
  const totalPro = records.reduce((sum, r) => sum + safeNum(r.total_protein), 0);
  const totalCarbs = records.reduce((sum, r) => sum + safeNum(r.total_carbs), 0);
  const totalFat = records.reduce((sum, r) => sum + safeNum(r.total_fat), 0);
  const len = records.length || 1;
  return {
    avgCal: Math.round(totalCal / len),
    avgPro: Math.round(totalPro / len * 10) / 10,
    avgCarbs: Math.round(totalCarbs / len * 10) / 10,
    avgFat: Math.round(totalFat / len * 10) / 10
  };
}

// ============================================================
// 格式一：簡潔專業型
// ============================================================
window.generatePDF_Style1 = async function(records, endDateStr) {
  const { avgCal, avgPro, avgCarbs, avgFat } = calcStats(records);
  const startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() - 30);
  const startDateStr = getLocalDateStr(startDateObj);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // 標題
  doc.setFontSize(22);
  doc.setTextColor(45, 106, 79); // #2d6a4f
  doc.text('CaloScanAi 健康報表', 20, 25);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${endDateStr} | 近${records.length}天`, 20, 32);

  // 分隔線
  doc.setDrawColor(45, 106, 79);
  doc.setLineWidth(0.5);
  doc.line(20, 36, pageW - 20, 36);

  // 摘要格子
  const colW = (pageW - 40) / 4;
  const summaryY = 42;
  const items = [
    { value: avgCal, label: '平均熱量 (kcal)' },
    { value: avgPro + 'g', label: '平均蛋白質' },
    { value: avgCarbs + 'g', label: '平均碳水' },
    { value: avgFat + 'g', label: '平均脂肪' }
  ];

  doc.setFillColor(240, 249, 244); // #f0f9f4
  items.forEach((item, i) => {
    const x = 20 + i * colW;
    doc.roundedRect(x, summaryY, colW - 2, 20, 2, 2, 'F');
    doc.setFontSize(18);
    doc.setTextColor(45, 106, 79);
    doc.text(String(item.value), x + colW / 2, summaryY + 10, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, x + colW / 2, summaryY + 16, { align: 'center' });
  });

  // 表格標題
  const tableY = 70;
  doc.setFontSize(10);
  doc.setFillColor(45, 106, 79);
  doc.rect(20, tableY, pageW - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('日期', 25, tableY + 6);
  doc.text('熱量 (kcal)', 60, tableY + 6);
  doc.text('蛋白質 (g)', 95, tableY + 6);
  doc.text('碳水 (g)', 130, tableY + 6);
  doc.text('脂肪 (g)', 165, tableY + 6);

  // 表格內容
  let y = tableY + 10;
  doc.setTextColor(60, 60, 60);
  records.slice(0, 25).forEach((r, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    if (i % 2 === 0) {
      doc.setFillColor(249, 249, 249);
      doc.rect(20, y - 4, pageW - 40, 8, 'F');
    }
    doc.setFontSize(9);
    doc.text(safeDate(r.date).slice(5), 25, y + 2);
    doc.text(String(safeNum(r.total_calories)), 60, y + 2);
    doc.text(String(safeNum(r.total_protein)), 95, y + 2);
    doc.text(String(safeNum(r.total_carbs)), 130, y + 2);
    doc.text(String(safeNum(r.total_fat)), 165, y + 2);
    y += 8;
  });

  // 頁尾
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`由 CaloScanAi 自動生成 | ${new Date().toLocaleDateString('zh-TW')}`, pageW / 2, 290, { align: 'center' });

  doc.save(`caloscanai_report_style1_${endDateStr}.pdf`);
};

// ============================================================
// 格式二：卡片式
// ============================================================
window.generatePDF_Style2 = async function(records, endDateStr) {
  const { avgCal, avgPro, avgCarbs, avgFat } = calcStats(records);
  const icons = ['🔥', '💪', '🍞', '🥑'];

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // 標題
  doc.setFontSize(20);
  doc.setTextColor(60, 60, 60);
  doc.text('🍎 營養攝取報告', pageW / 2, 25, { align: 'center' });

  // 四格摘要卡片
  const colW = (pageW - 40) / 4;
  const summaryY = 35;
  const items = [
    { icon: icons[0], value: avgCal, label: '平均熱量' },
    { icon: icons[1], value: avgPro + 'g', label: '蛋白質' },
    { icon: icons[2], value: avgCarbs + 'g', label: '碳水' },
    { icon: icons[3], value: avgFat + 'g', label: '脂肪' }
  ];

  items.forEach((item, i) => {
    const x = 20 + i * colW;
    // 白底卡片陰影
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x + 1, summaryY + 1, colW - 2, 28, 3, 3, 'F');
    // 白底卡片
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, summaryY, colW - 2, 28, 3, 3, 'F');
    // 數值
    doc.setFontSize(16);
    doc.setTextColor(102, 126, 234); // #667eea
    doc.text(String(item.value), x + colW / 2, summaryY + 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, x + colW / 2, summaryY + 22, { align: 'center' });
  });

  // 每日卡片（週視圖）
  const cardStartY = 72;
  const cardW = (pageW - 50) / 7;
  const recentRecords = records.slice(0, 7);

  recentRecords.forEach((r, i) => {
    const x = 20 + i * cardW;
    // 卡片背景
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(x, cardStartY, cardW - 2, 25, 2, 2, 'F');
    // 日期
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(safeDate(r.date).slice(5), x + cardW / 2, cardStartY + 8, { align: 'center' });
    // 熱量
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const calStr = safeNum(r.total_calories) > 999 ? (safeNum(r.total_calories) / 1000).toFixed(1) + 'k' : String(safeNum(r.total_calories));
    doc.text(calStr, x + cardW / 2, cardStartY + 18, { align: 'center' });
  });

  // 完整表格
  let y = 105;
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('每日詳細記錄', 20, y);
  y += 8;

  recentRecords.forEach((r, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, y - 4, pageW - 40, 18, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(safeDate(r.date), 25, y + 4);
    doc.text(`🔥 ${safeNum(r.total_calories)} kcal`, 60, y + 4);
    doc.text(`💪 ${safeNum(r.total_protein)}g`, 100, y + 4);
    doc.text(`🍞 ${safeNum(r.total_carbs)}g`, 135, y + 4);
    doc.text(`🥑 ${safeNum(r.total_fat)}g`, 170, y + 4);
    y += 20;
  });

  // 頁尾
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`CaloScanAi | ${new Date().toLocaleDateString('zh-TW')}`, pageW / 2, 290, { align: 'center' });

  doc.save(`caloscanai_report_style2_${endDateStr}.pdf`);
};

// ============================================================
// 格式三：圖表視覺型
// ============================================================
window.generatePDF_Style3 = async function(records, endDateStr) {
  const { avgCal, avgPro, avgCarbs, avgFat } = calcStats(records);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // 標題
  doc.setFontSize(20);
  doc.setTextColor(60, 60, 60);
  doc.text('📊 每週營養分析', pageW / 2, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('攝取趨勢視覺化', pageW / 2, 27, { align: 'center' });

  // 圖表區背景
  const chartY = 35;
  doc.setFillColor(248, 250, 255); // #667eea20
  doc.roundedRect(20, chartY, pageW - 40, 60, 4, 4, 'F');

  // 柱狀圖（取近7天）
  const recentRecords = records.slice(0, 7);
  const barW = (pageW - 60) / 7;
  const maxCal = Math.max(...recentRecords.map(r => safeNum(r.total_calories)), 1);
  const chartBottom = chartY + 50;

  recentRecords.forEach((r, i) => {
    const barHeight = (safeNum(r.total_calories) / maxCal) * 40;
    const x = 30 + i * barW;
    // 漸層效果用不同顏色
    const hue = 330 + i * 5;
    doc.setFillColor(240, 147, 251); // #f093fb 頂部
    doc.roundedRect(x, chartBottom - barHeight, barW - 4, barHeight, 1, 1, 'F');
    doc.setFillColor(245, 87, 108); // #f5576c 底部
    doc.roundedRect(x, chartBottom - barHeight, barW - 4, barHeight / 3, 0, 0, 'F');
  });

  // X軸標籤
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  recentRecords.forEach((r, i) => {
    const x = 30 + i * barW;
    doc.text(days[i] || '', x + barW / 2, chartBottom + 6, { align: 'center' });
  });

  // 摘要數據
  const summaryY = 110;
  const colW = (pageW - 40) / 4;
  const items = [
    { value: avgCal, label: '平均熱量' },
    { value: avgPro + 'g', label: '蛋白質' },
    { value: avgCarbs + 'g', label: '碳水' },
    { value: avgFat + 'g', label: '脂肪' }
  ];

  items.forEach((item, i) => {
    const x = 20 + i * colW;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, summaryY, colW - 2, 25, 3, 3, 'F');
    doc.setFontSize(16);
    doc.setTextColor(245, 87, 108); // #f5576c
    doc.text(String(item.value), x + colW / 2, summaryY + 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, x + colW / 2, summaryY + 20, { align: 'center' });
  });

  // 詳細表格
  let y = 145;
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('每日記錄', 20, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFillColor(240, 147, 251);
  doc.rect(20, y, pageW - 40, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('日期', 25, y + 4);
  doc.text('熱量', 60, y + 4);
  doc.text('蛋白質', 95, y + 4);
  doc.text('碳水', 130, y + 4);
  doc.text('脂肪', 165, y + 4);
  y += 8;

  records.slice(0, 20).forEach((r, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(60, 60, 60);
    doc.text(safeDate(r.date).slice(5), 25, y + 2);
    doc.text(String(safeNum(r.total_calories)), 60, y + 2);
    doc.text(String(safeNum(r.total_protein)), 95, y + 2);
    doc.text(String(safeNum(r.total_carbs)), 130, y + 2);
    doc.text(String(safeNum(r.total_fat)), 165, y + 2);
    y += 7;
  });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`CaloScanAi | ${new Date().toLocaleDateString('zh-TW')}`, pageW / 2, 290, { align: 'center' });

  doc.save(`caloscanai_report_style3_${endDateStr}.pdf`);
};

// ============================================================
// 格式四：雜誌風格（英文）
// ============================================================
window.generatePDF_Style4 = async function(records, endDateStr) {
  const { avgCal, avgPro, avgCarbs, avgFat } = calcStats(records);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // 全寬黑色標題
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageW, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.text('HEALTH REPORT', pageW / 2, 22, { align: 'center' });
  doc.setFontSize(12);
  doc.text('CALOSCANAI', pageW / 2, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`${records.length}-DAY SUMMARY`, pageW / 2, 40, { align: 'center' });

  // 大數字 hero
  const heroY = 60;
  doc.setFillColor(245, 245, 245);
  doc.rect(20, heroY, pageW - 40, 45, 'F');

  doc.setFontSize(48);
  doc.setTextColor(0, 0, 0);
  doc.text(String(avgCal), pageW / 2, heroY + 25, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('DAILY AVERAGE CALORIES', pageW / 2, heroY + 38, { align: 'center' });

  // 三格營養素
  const nutriY = 115;
  const colW = (pageW - 40) / 3;

  const nutrients = [
    { value: avgPro + 'g', label: 'PROTEIN' },
    { value: avgCarbs + 'g', label: 'CARBS' },
    { value: avgFat + 'g', label: 'FAT' }
  ];

  nutrients.forEach((n, i) => {
    const x = 20 + i * colW;
    doc.setFillColor(248, 248, 248);
    doc.rect(x, nutriY, colW - 2, 35, 'F');
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text(n.value, x + colW / 2, nutriY + 16, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(n.label, x + colW / 2, nutriY + 28, { align: 'center' });
  });

  // 日期列表
  let y = 165;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('DAILY BREAKDOWN', 20, y);
  y += 5;

  records.slice(0, 15).forEach((r, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const bgColor = i % 2 === 0 ? 248 : 255;
    doc.setFillColor(bgColor);
    doc.rect(20, y - 3, pageW - 40, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(safeDate(r.date), 25, y + 2);
    doc.setTextColor(0, 0, 0);
    doc.text(`${safeNum(r.total_calories)} kcal`, 60, y + 2);
    doc.text(`P: ${safeNum(r.total_protein)}g`, 100, y + 2);
    doc.text(`C: ${safeNum(r.total_carbs)}g`, 135, y + 2);
    doc.text(`F: ${safeNum(r.total_fat)}g`, 170, y + 2);
    y += 10;
  });

  // 頁尾
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`CALOSCANAI | ${endDateStr} | ${records.length}-DAY REPORT`, pageW / 2, 290, { align: 'center' });

  doc.save(`caloscanai_report_style4_${endDateStr}.pdf`);
};

// ============================================================
// 格式五：資料庫風格
// ============================================================
window.generatePDF_Style5 = async function(records, endDateStr) {
  const { avgCal, avgPro, avgCarbs, avgFat } = calcStats(records);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // 標題
  doc.setFontSize(18);
  doc.setTextColor(17, 153, 142); // #11998e
  doc.text('Daily Summary', 20, 25);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Period: ${records.length > 0 ? records[records.length - 1].date : 'N/A'} ~ ${endDateStr}`, 20, 32);

  // 分隔線
  doc.setDrawColor(17, 153, 142);
  doc.setLineWidth(0.3);
  doc.line(20, 36, pageW - 20, 36);

  // 統計列
  const stats = [
    { label: 'Average Calories', value: avgCal + ' kcal' },
    { label: 'Average Protein', value: avgPro + 'g' },
    { label: 'Average Carbs', value: avgCarbs + 'g' },
    { label: 'Average Fat', value: avgFat + 'g' }
  ];

  let y = 42;
  stats.forEach(stat => {
    doc.setFillColor(250, 252, 251);
    doc.rect(20, y, pageW - 40, 7, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(stat.label, 25, y + 5);
    doc.setTextColor(17, 153, 142);
    doc.text(stat.value, pageW - 25, y + 5, { align: 'right' });
    y += 9;
  });

  // 表格
  y += 5;
  doc.setFontSize(10);
  doc.setFillColor(17, 153, 142);
  doc.rect(20, y, pageW - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Date', 25, y + 5.5);
  doc.text('Cal', 70, y + 5.5);
  doc.text('P', 100, y + 5.5);
  doc.text('C', 130, y + 5.5);
  doc.text('F', 160, y + 5.5);
  y += 10;

  records.slice(0, 30).forEach((r, i) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(9);
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, y - 4, pageW - 40, 8, 'F');
    }
    doc.setTextColor(17, 153, 142);
    doc.text(safeDate(r.date), 25, y + 2);
    doc.setTextColor(60, 60, 60);
    doc.text(String(safeNum(r.total_calories)), 70, y + 2);
    doc.text(String(safeNum(r.total_protein)), 100, y + 2);
    doc.text(String(safeNum(r.total_carbs)), 130, y + 2);
    doc.text(String(safeNum(r.total_fat)), 160, y + 2);
    y += 8;
  });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated by CaloScanAi | ${new Date().toLocaleDateString('zh-TW')}`, pageW / 2, 290, { align: 'center' });

  doc.save(`caloscanai_report_style5_${endDateStr}.pdf`);
};

// ============================================================
// 格式六：現代清新風
// ============================================================
window.generatePDF_Style6 = async function(records, endDateStr) {
  const { avgCal, avgPro, avgCarbs, avgFat } = calcStats(records);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // Emoji 標題
  doc.setFontSize(36);
  doc.text('📋', pageW / 2, 25, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor(60, 60, 60);
  doc.text('30天健康報告', pageW / 2, 38, { align: 'center' });

  // 摘要（圓角膠囊）
  const sumY = 50;
  const items = [
    { value: avgCal, label: '平均熱量' },
    { value: avgPro + 'g', label: '蛋白質' },
    { value: avgCarbs + 'g', label: '碳水' },
    { value: avgFat + 'g', label: '脂肪' }
  ];

  const totalW = items.length * 45 + (items.length - 1) * 5;
  const startX = (pageW - totalW) / 2;

  items.forEach((item, i) => {
    const x = startX + i * 50;
    // 漸層背景
    doc.setFillColor(168, 237, 234, 50); // #a8edea with alpha
    doc.roundedRect(x, sumY, 45, 28, 14, 14, 'F');
    doc.setFillColor(254, 214, 227, 50); // #fed6e3 with alpha
    doc.roundedRect(x + 2, sumY + 2, 41, 24, 12, 12, 'F');
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x + 2, sumY + 2, 41, 22, 10, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(String(item.value), x + 22.5, sumY + 12, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, x + 22.5, sumY + 20, { align: 'center' });
  });

  // 每週卡片
  const weekY = 90;
  const recentRecords = records.slice(0, 14);
  const cardW = (pageW - 50) / 7;
  const cardH = 30;

  recentRecords.forEach((r, i) => {
    const col = i % 7;
    const row = Math.floor(i / 7);
    const x = 20 + col * cardW;
    const y = weekY + row * (cardH + 5);

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(x, y, cardW - 2, cardH, 4, 4, 'F');

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    doc.text(days[col] || '', x + cardW / 2, y + 8, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const dateStr = safeDate(r.date).slice(5);
    doc.text(dateStr, x + cardW / 2, y + 16, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const calStr = safeNum(r.total_calories) > 999 ? (safeNum(r.total_calories) / 1000).toFixed(1) + 'k' : String(safeNum(r.total_calories));
    doc.text(calStr, x + cardW / 2, y + 24, { align: 'center' });
  });

  // 頁尾
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('✨ 由 CaloScanAi 為您生成 ✨', pageW / 2, 280, { align: 'center' });

  doc.save(`caloscanai_report_style6_${endDateStr}.pdf`);
};

// ============================================================
// 測試函式：從 API 取得資料產生 PDF
// ============================================================
window.downloadPDF_Style = async function(style, days = 30) {
  try {
    const toLocalDateStr = (d) => {
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const taiwan = new Date(utc + (8 * 60 * 60 * 1000));
      const y = taiwan.getFullYear();
      const m = String(taiwan.getMonth() + 1).padStart(2, '0');
      const day = String(taiwan.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const endDateObj = new Date();
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - days);
    const endDateStr = toLocalDateStr(endDateObj);
    const startDateStr = toLocalDateStr(startDateObj);

    const response = await fetch('/api/progress/history?startDate=' + startDateStr + '&endDate=' + endDateStr + '&limit=' + days, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });

    const result = await response.json();
    if (!result.success || !result.data.records.length) {
      alert('尚無資料可匯出');
      return;
    }

    const generatorMap = {
      1: window.generatePDF_Style1,
      2: window.generatePDF_Style2,
      3: window.generatePDF_Style3,
      4: window.generatePDF_Style4,
      5: window.generatePDF_Style5,
      6: window.generatePDF_Style6
    };

    const generator = generatorMap[style];
    if (generator) {
      await generator(result.data.records, endDateStr);
    }
  } catch (error) {
    console.error('PDF download error:', error);
    alert('匯出失敗');
  }
};