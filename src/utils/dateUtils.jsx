  export const getMonthLabels = () => {
    const now = new Date();
    const months = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "2-digit",
      });
      const parts = formatter.formatToParts(date);
      const monthPart = parts.find(p => p.type === "month").value.toUpperCase();
      const yearPart = parts.find(p => p.type === "year").value;
      months.push(`${monthPart} ${yearPart}`);
    }
    return months;
  };
  
  export function getMonthLabelsFrom(startMonthLabel) {
    const [startMonthStr, startYearStr] = startMonthLabel.split(' ');
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    let startMonth = months.indexOf(startMonthStr.toUpperCase());
    let year = parseInt(startYearStr, 10);
    const labels = [];
    for (let i = 0; i < 14; i++) {
      labels.push(`${months[startMonth]} ${year}`);
      startMonth++;
      if (startMonth >= 12) {
        startMonth = 0; year++;
      }
    }
    return labels;
  }