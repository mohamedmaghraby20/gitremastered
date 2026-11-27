//! Writes a moment as ISO 8601 text (`2026-11-27T10:00:00Z`), for a GitHub challenge's start
//! when GitHub's own clock is not available. Small on purpose: no date library needed.

use std::time::{SystemTime, UNIX_EPOCH};

/// The local clock's "now", as ISO 8601 text in UTC.
///
/// Inputs: none. Output: the text.
pub fn now_as_iso_text() -> String {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|elapsed| elapsed.as_secs())
        .unwrap_or(0);
    seconds_as_iso_text(seconds)
}

/// Writes seconds since 1970 as ISO 8601 text in UTC.
///
/// Input: the seconds. Output: the text, like "2026-11-27T10:00:00Z".
pub fn seconds_as_iso_text(seconds: u64) -> String {
    let days = (seconds / 86_400) as i64;
    let second_of_day = seconds % 86_400;
    let (year, month, day) = civil_date_from_days(days);
    let hour = second_of_day / 3_600;
    let minute = (second_of_day % 3_600) / 60;
    let second = second_of_day % 60;
    format!("{year:04}-{month:02}-{day:02}T{hour:02}:{minute:02}:{second:02}Z")
}

/// Turns a day count since 1970-01-01 into a calendar date (Howard Hinnant's well-known
/// "days from civil" method, run backwards).
///
/// Input: the days. Output: year, month (1-12) and day (1-31).
fn civil_date_from_days(days: i64) -> (i64, u32, u32) {
    let shifted = days + 719_468;
    let era = shifted.div_euclid(146_097);
    let day_of_era = shifted.rem_euclid(146_097);
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_index = (5 * day_of_year + 2) / 153;
    let day = (day_of_year - (153 * month_index + 2) / 5 + 1) as u32;
    let month = if month_index < 10 {
        month_index + 3
    } else {
        month_index - 9
    } as u32;
    let year = year_of_era + era * 400 + i64::from(month <= 2);
    (year, month, day)
}

#[cfg(test)]
mod tests {
    use super::seconds_as_iso_text;

    /// Known moments come out right, including a leap day.
    #[test]
    fn writes_known_moments() {
        assert_eq!(seconds_as_iso_text(0), "1970-01-01T00:00:00Z");
        assert_eq!(seconds_as_iso_text(951_782_400), "2000-02-29T00:00:00Z");
        assert_eq!(seconds_as_iso_text(1_795_773_600), "2026-11-27T10:00:00Z");
    }
}
