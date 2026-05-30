// CaloScanAi PDF 報告產生器 - 六種格式
// 使用 html2canvas 轉圖片再轉 PDF，支援中文

const safeNum = (n) => n == null ? 0 : (isNaN(n) ? 0 : Number(n));
const safeDate = (d) => d == null ? '' : String(d);

function getLocalDateStr(date) {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const taiwan = new Date(utc + (8 * 60 * 60 * 1000));
  const y = taiwan.getFullYear();
  const m = String(taiwan.getMonth() + 1).padStart(2, '0');
  const day = String(taiwan.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

// 建立隱藏的 HTML 容器用於渲染
function createPDFContainer(style, stats, records, endDateStr) {
  const { avgCal, avgPro, avgCarbs, avgFat } = stats;

  const container = document.createElement('div');
  container.id = 'pdf-render-container';
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 595px;
    min-height: 842px;
    background: white;
    font-family: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', Arial, sans-serif;
    padding: 40px;
    box-sizing: border-box;
  `;

  // 根據格式填充內容
  let html = '';

  if (style === 1) {
    // 格式一：簡潔專業型
    html = `
      <div style="font-size:24px; color:#2d6a4f; border-bottom:3px solid #2d6a4f; padding-bottom:12px; margin-bottom:20px;">
        CaloScanAi 健康報表
      </div>
      <div style="font-size:12px; color:#666; margin-bottom:25px;">
        ${endDateStr} | 近${records.length}天
      </div>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:15px; margin-bottom:30px;">
        <div style="background:#f0f9f4; padding:15px; border-radius:8px; text-align:center; border-left:4px solid #2d6a4f;">
          <div style="font-size:28px; font-weight:bold; color:#2d6a4f;">${avgCal}</div>
          <div style="font-size:12px; color:#666;">平均熱量 (kcal)</div>
        </div>
        <div style="background:#f0f9f4; padding:15px; border-radius:8px; text-align:center; border-left:4px solid #2d6a4f;">
          <div style="font-size:28px; font-weight:bold; color:#2d6a4f;">${avgPro}g</div>
          <div style="font-size:12px; color:#666;">平均蛋白質</div>
        </div>
        <div style="background:#f0f9f4; padding:15px; border-radius:8px; text-align:center; border-left:4px solid #2d6a4f;">
          <div style="font-size:28px; font-weight:bold; color:#2d6a4f;">${avgCarbs}g</div>
          <div style="font-size:12px; color:#666;">平均碳水</div>
        </div>
        <div style="background:#f0f9f4; padding:15px; border-radius:8px; text-align:center; border-left:4px solid #2d6a4f;">
          <div style="font-size:28px; font-weight:bold; color:#2d6a4f;">${avgFat}g</div>
          <div style="font-size:12px; color:#666;">平均脂肪</div>
        </div>
      </div>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#2d6a4f; color:white;">
            <th style="padding:10px; text-align:center;">日期</th>
            <th style="padding:10px; text-align:center;">熱量 (kcal)</th>
            <th style="padding:10px; text-align:center;">蛋白質 (g)</th>
            <th style="padding:10px; text-align:center;">碳水 (g)</th>
            <th style="padding:10px; text-align:center;">脂肪 (g)</th>
          </tr>
        </thead>
        <tbody>
          ${records.slice(0, 20).map((r, i) => `
            <tr style="background:${i % 2 === 0 ? '#f9f9f9' : 'white'};">
              <td style="padding:10px; text-align:center;">${safeDate(r.date).slice(5)}</td>
              <td style="padding:10px; text-align:center;">${safeNum(r.total_calories)}</td>
              <td style="padding:10px; text-align:center;">${safeNum(r.total_protein)}</td>
              <td style="padding:10px; text-align:center;">${safeNum(r.total_carbs)}</td>
              <td style="padding:10px; text-align:center;">${safeNum(r.total_fat)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align:center; margin-top:40px; font-size:10px; color:#999;">
        由 CaloScanAi 自動生成 | ${new Date().toLocaleDateString('zh-TW')}
      </div>
    `;
  } else if (style === 2) {
    // 格式二：卡片式
    html = `
      <div style="font-size:22px; text-align:center; margin-bottom:25px; color:#333;">
        🍎 營養攝取報告
      </div>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:15px; margin-bottom:30px;">
        <div style="background:white; border-radius:12px; padding:20px; text-align:center; box-shadow:0 4px 15px rgba(102,126,234,0.15);">
          <div style="font-size:30px; margin-bottom:8px;">🔥</div>
          <div style="font-size:24px; font-weight:bold; background:linear-gradient(135deg,#667eea,#764ba2); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${avgCal}</div>
          <div style="font-size:12px; color:#666;">平均熱量</div>
        </div>
        <div style="background:white; border-radius:12px; padding:20px; text-align:center; box-shadow:0 4px 15px rgba(102,126,234,0.15);">
          <div style="font-size:30px; margin-bottom:8px;">💪</div>
          <div style="font-size:24px; font-weight:bold; background:linear-gradient(135deg,#667eea,#764ba2); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${avgPro}g</div>
          <div style="font-size:12px; color:#666;">蛋白質</div>
        </div>
        <div style="background:white; border-radius:12px; padding:20px; text-align:center; box-shadow:0 4px 15px rgba(102,126,234,0.15);">
          <div style="font-size:30px; margin-bottom:8px;">🍞</div>
          <div style="font-size:24px; font-weight:bold; background:linear-gradient(135deg,#667eea,#764ba2); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${avgCarbs}g</div>
          <div style="font-size:12px; color:#666;">碳水</div>
        </div>
        <div style="background:white; border-radius:12px; padding:20px; text-align:center; box-shadow:0 4px 15px rgba(102,126,234,0.15);">
          <div style="font-size:30px; margin-bottom:8px;">🥑</div>
          <div style="font-size:24px; font-weight:bold; background:linear-gradient(135deg,#667eea,#764ba2); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${avgFat}g</div>
          <div style="font-size:12px; color:#666;">脂肪</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:8px; margin-bottom:20px;">
        ${records.slice(0, 7).map(r => `
          <div style="background:#f8f9fa; border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:11px; color:#999;">${safeDate(r.date).slice(5)}</div>
            <div style="font-size:14px; font-weight:bold; color:#333;">${safeNum(r.total_calories)}</div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center; font-size:10px; color:#999; margin-top:20px;">
        CaloScanAi | ${new Date().toLocaleDateString('zh-TW')}
      </div>
    `;
  } else if (style === 3) {
    // 格式三：圖表視覺型
    const maxCal = Math.max(...records.slice(0, 7).map(r => safeNum(r.total_calories)), 1);
    html = `
      <div style="font-size:22px; text-align:center; color:#333; margin-bottom:5px;">
        📊 每週營養分析
      </div>
      <div style="font-size:12px; text-align:center; color:#999; margin-bottom:20px;">
        攝取趨勢視覺化
      </div>
      <div style="background:linear-gradient(135deg,rgba(102,126,234,0.1),rgba(118,75,162,0.1)); border-radius:16px; padding:20px; margin-bottom:20px; display:flex; align-items:flex-end; justify-content:space-between; height:120px;">
        ${records.slice(0, 7).map((r, i) => {
          const h = Math.round((safeNum(r.total_calories) / maxCal) * 100);
          const hues = ['#f093fb', '#f5576c', '#667eea', '#764ba2', '#2d6a4f', '#11998e', '#38ef7d'];
          return `<div style="width:40px; background:linear-gradient(180deg,${hues[i]},${hues[i]}80); border-radius:4px 4px 0 0; height:${h}%;"></div>`;
        }).join('')}
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:11px; color:#666;">
        <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:15px; margin-bottom:20px;">
        <div style="background:white; border-radius:12px; padding:15px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
          <div style="font-size:24px; font-weight:bold; color:#f5576c;">${avgCal}</div>
          <div style="font-size:11px; color:#666;">平均熱量</div>
        </div>
        <div style="background:white; border-radius:12px; padding:15px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
          <div style="font-size:24px; font-weight:bold; color:#f5576c;">${avgPro}g</div>
          <div style="font-size:11px; color:#666;">蛋白質</div>
        </div>
        <div style="background:white; border-radius:12px; padding:15px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
          <div style="font-size:24px; font-weight:bold; color:#f5576c;">${avgCarbs}g</div>
          <div style="font-size:11px; color:#666;">碳水</div>
        </div>
        <div style="background:white; border-radius:12px; padding:15px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
          <div style="font-size:24px; font-weight:bold; color:#f5576c;">${avgFat}g</div>
          <div style="font-size:11px; color:#666;">脂肪</div>
        </div>
      </div>
      <div style="text-align:center; font-size:10px; color:#999; margin-top:20px;">
        CaloScanAi | ${new Date().toLocaleDateString('zh-TW')}
      </div>
    `;
  } else if (style === 4) {
    // 格式四：雜誌風格（英文）
    html = `
      <div style="background:black; color:white; padding:30px; text-align:center; margin-bottom:30px;">
        <div style="font-size:36px; font-weight:bold; letter-spacing:2px;">HEALTH REPORT</div>
        <div style="font-size:14px; margin-top:10px;">CALOSCANAI | ${records.length}-DAY SUMMARY</div>
      </div>
      <div style="text-align:center; padding:30px 0; border-bottom:1px dashed #ccc; margin-bottom:25px;">
        <div style="font-size:72px; font-weight:bold; color:#000; line-height:1;">${avgCal}</div>
        <div style="font-size:14px; color:#666; text-transform:uppercase; letter-spacing:3px; margin-top:10px;">Daily Average Calories</div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:30px;">
        <div style="background:#f5f5f5; padding:25px; text-align:center;">
          <div style="font-size:36px; font-weight:bold; color:#000;">${avgPro}g</div>
          <div style="font-size:12px; color:#666; text-transform:uppercase;">Protein</div>
        </div>
        <div style="background:#f5f5f5; padding:25px; text-align:center;">
          <div style="font-size:36px; font-weight:bold; color:#000;">${avgCarbs}g</div>
          <div style="font-size:12px; color:#666; text-transform:uppercase;">Carbs</div>
        </div>
        <div style="background:#f5f5f5; padding:25px; text-align:center;">
          <div style="font-size:36px; font-weight:bold; color:#000;">${avgFat}g</div>
          <div style="font-size:12px; color:#666; text-transform:uppercase;">Fat</div>
        </div>
      </div>
      <table style="width:100%; border-collapse:collapse;">
        ${records.slice(0, 15).map((r, i) => `
          <tr style="background:${i % 2 === 0 ? '#f9f9f9' : 'white'};">
            <td style="padding:8px; color:#666;">${safeDate(r.date)}</td>
            <td style="padding:8px; font-weight:bold;">${safeNum(r.total_calories)} kcal</td>
            <td style="padding:8px;">P: ${safeNum(r.total_protein)}g</td>
            <td style="padding:8px;">C: ${safeNum(r.total_carbs)}g</td>
            <td style="padding:8px;">F: ${safeNum(r.total_fat)}g</td>
          </tr>
        `).join('')}
      </table>
      <div style="text-align:center; margin-top:30px; font-size:10px; color:#999;">
        CALOSCANAI | ${endDateStr} | ${records.length}-DAY REPORT
      </div>
    `;
  } else if (style === 5) {
    // 格式五：資料庫風格
    html = `
      <div style="font-size:22px; color:#11998e; margin-bottom:5px;">Daily Summary</div>
      <div style="font-size:12px; color:#666; margin-bottom:20px;">
        Report Period: ${records.length > 0 ? records[records.length - 1].date : 'N/A'} ~ ${endDateStr}
      </div>
      <div style="border-bottom:1px solid #11998e; margin-bottom:20px;"></div>
      ${[
        { label: 'Average Calories', value: avgCal + ' kcal' },
        { label: 'Average Protein', value: avgPro + 'g' },
        { label: 'Average Carbs', value: avgCarbs + 'g' },
        { label: 'Average Fat', value: avgFat + 'g' }
      ].map(s => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
          <span style="color:#666;">${s.label}</span>
          <span style="font-weight:bold; color:#11998e;">${s.value}</span>
        </div>
      `).join('')}
      <table style="width:100%; border-collapse:collapse; margin-top:20px;">
        <thead>
          <tr style="background:#11998e; color:white;">
            <th style="padding:8px; text-align:left;">Date</th>
            <th style="padding:8px; text-align:right;">Cal</th>
            <th style="padding:8px;">P</th>
            <th style="padding:8px;">C</th>
            <th style="padding:8px;">F</th>
          </tr>
        </thead>
        <tbody>
          ${records.slice(0, 25).map((r, i) => `
            <tr style="background:${i % 2 === 0 ? '#fafafa' : 'white'};">
              <td style="padding:8px; color:#11998e; font-weight:bold;">${safeDate(r.date)}</td>
              <td style="padding:8px; text-align:right;">${safeNum(r.total_calories)}</td>
              <td style="padding:8px;">${safeNum(r.total_protein)}</td>
              <td style="padding:8px;">${safeNum(r.total_carbs)}</td>
              <td style="padding:8px;">${safeNum(r.total_fat)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align:center; margin-top:20px; font-size:10px; color:#999;">
        Generated by CaloScanAi | ${new Date().toLocaleDateString('zh-TW')}
      </div>
    `;
  } else if (style === 6) {
    // 格式六：現代清新風
    html = `
      <div style="font-size:40px; text-align:center; margin-bottom:10px;">📋</div>
      <div style="font-size:22px; text-align:center; color:#333; margin-bottom:25px;">30天健康報告</div>
      <div style="display:flex; justify-content:center; gap:15px; margin-bottom:30px;">
        ${[
          { value: avgCal, label: '平均熱量' },
          { value: avgPro + 'g', label: '蛋白質' },
          { value: avgCarbs + 'g', label: '碳水' },
          { value: avgFat + 'g', label: '脂肪' }
        ].map(item => `
          <div style="background:linear-gradient(135deg,rgba(168,237,234,0.3),rgba(254,214,227,0.3)); padding:15px 20px; border-radius:20px; text-align:center;">
            <div style="font-size:18px; font-weight:bold; color:#333;">${item.value}</div>
            <div style="font-size:11px; color:#666;">${item.label}</div>
          </div>
        `).join('')}
      </div>
      <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:8px; margin-bottom:20px;">
        ${records.slice(0, 14).map((r, i) => {
          const days = ['一', '二', '三', '四', '五', '六', '日'];
          const col = i % 7;
          return `
            <div style="background:#f8f9fa; border-radius:10px; padding:12px; text-align:center;">
              <div style="font-size:10px; color:#999;">${days[col]}</div>
              <div style="font-size:13px; font-weight:bold; color:#333;">${safeDate(r.date).slice(5)}</div>
              <div style="font-size:11px; color:#666; margin-top:5px;">${safeNum(r.total_calories)}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="text-align:center; margin-top:25px; font-size:12px; color:#999;">
        ✨ 由 CaloScanAi 為您生成 ✨
      </div>
    `;
  }

  container.innerHTML = html;
  return container;
}

// 產生 PDF
window.generatePDF_Style = async function(style, records, endDateStr) {
  const stats = calcStats(records);

  // 建立 HTML 容器
  const container = createPDFContainer(style, stats, records, endDateStr);
  document.body.appendChild(container);

  // 等待 html2canvas
  if (typeof html2canvas === 'undefined') {
    await window.loadHtml2Canvas();
  }

  // 截圖
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: 595,
    height: container.scrollHeight
  });

  // 移除容器
  document.body.removeChild(container);

  // 建立 PDF (A5 格式，適合手機)
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210] // A5
  });

  const imgWidth = 148;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 210));

  doc.save(`caloscanai_report_style${style}_${endDateStr}.pdf`);
};

// 測試用：下載指定格式
window.downloadPDF_Style = async function(style) {
  const toLocalDateStr = (d) => {
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const taiwan = new Date(utc + (8 * 60 * 60 * 1000));
    const y = taiwan.getFullYear();
    const m = String(taiwan.getMonth() + 1).padStart(2, '0');
    const day = String(taiwan.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const endDateObj = new Date();
  const endDateStr = toLocalDateStr(endDateObj);

  // 模擬資料
  const mockRecords = [
    { date: '2026-05-30', total_calories: 1920, total_protein: 68, total_carbs: 230, total_fat: 58 },
    { date: '2026-05-29', total_calories: 1780, total_protein: 62, total_carbs: 210, total_fat: 52 },
    { date: '2026-05-28', total_calories: 2050, total_protein: 72, total_carbs: 245, total_fat: 60 },
    { date: '2026-05-27', total_calories: 1680, total_protein: 58, total_carbs: 200, total_fat: 48 },
    { date: '2026-05-26', total_calories: 1890, total_protein: 65, total_carbs: 225, total_fat: 55 },
    { date: '2026-05-25', total_calories: 1750, total_protein: 60, total_carbs: 210, total_fat: 50 },
    { date: '2026-05-24', total_calories: 2100, total_protein: 75, total_carbs: 250, total_fat: 62 },
    { date: '2026-05-23', total_calories: 1820, total_protein: 64, total_carbs: 218, total_fat: 54 },
    { date: '2026-05-22', total_calories: 1950, total_protein: 70, total_carbs: 235, total_fat: 58 },
    { date: '2026-05-21', total_calories: 1720, total_protein: 59, total_carbs: 205, total_fat: 49 },
    { date: '2026-05-20', total_calories: 1880, total_protein: 66, total_carbs: 228, total_fat: 56 },
    { date: '2026-05-19', total_calories: 1650, total_protein: 57, total_carbs: 198, total_fat: 47 },
    { date: '2026-05-18', total_calories: 2020, total_protein: 73, total_carbs: 242, total_fat: 61 },
    { date: '2026-05-17', total_calories: 1790, total_protein: 63, total_carbs: 215, total_fat: 53 },
  ];

  await window.generatePDF_Style(style, mockRecords, endDateStr);
};