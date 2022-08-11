// Website: https://kintai.ccbizmate.biz/J01/J0101WorkResultInput

const CALENDAR_TABLE_SELECTOR = "#calendar .wj-calendar-month";
// 还没有填写出勤信息的日期<td>的class
const PENDING_INPUT_TD_CLASS = "non-regist";
const JAPANESE_HOLIDAY_TD_CLASS = "non-legal-holiday-work"
const WEEKEND_TD_CLASS = "wj-day-weekend";
const PENDING_INPUT_TD_SELECTOR = `${CALENDAR_TABLE_SELECTOR} td.${PENDING_INPUT_TD_CLASS}:not(.${JAPANESE_HOLIDAY_TD_CLASS}):not(.${WEEKEND_TD_CLASS})`;

function main()
{
	const pendingInputTds = [].slice.apply(document.querySelectorAll(PENDING_INPUT_TD_SELECTOR));
	for (const td of pendingInputTds)
	{
		fillKintai(td)
	}
}

function fillKintai(dayTd)
{
	td.click();
}

main();
