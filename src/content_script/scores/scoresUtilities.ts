

export async function getFinalPercent(frn: string, fg: string): Promise<number | null> {
  let finalGrade: number | null = null;
  let text: string | null = null;
  try {
    text = await fetch(
      `https://powerschool.sas.edu.sg/guardian/scores_ms_guardian.html?frn=${frn}&fg=${fg}`,
    ).then((res) => res.text());
  } catch (e) {
    console.error(e);
    return null;
  }

  if (text) {
    let match = text.match(/\[decode;[^;]*;[^;]*;([^;]*);/);
    if (match?.[1] && !isNaN(parseFloat(match[1]))) {
      finalGrade = parseFloat(match[1]);
      return finalGrade;
    } else {
      match = text.match(/\[decode;[^;]*;[^;]*;[^;]*;([^\]]*)/);
      if (match?.[1] && !isNaN(parseFloat(match[1]))) {
        finalGrade = parseFloat(match[1]);
        return finalGrade;
      }
    }
  }
  return null;
}