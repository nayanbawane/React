/**
 *  Converts a number to its English word representation.
 *  @author: Kishan Jotaniya
**/

const TENS = ['', ' ten', ' twenty', ' thirty', ' forty', ' fifty', ' sixty', ' seventy', ' eighty', ' ninety'];
const ONES = ['', ' one', ' two', ' three', ' four', ' five', ' six', ' seven', ' eight', ' nine',
  ' ten', ' eleven', ' twelve', ' thirteen', ' fourteen', ' fifteen',
  ' sixteen', ' seventeen', ' eighteen', ' nineteen'];

function convertLessThanOneThousand(n: number): string {
  let result: string;
  if (n % 100 < 20) {
    result = ONES[n % 100];
    n = Math.floor(n / 100);
  } else {
    result = ONES[n % 10];
    n = Math.floor(n / 10);
    result = TENS[n % 10] + result;
    n = Math.floor(n / 10);
  }
  return n === 0 ? result : ONES[n] + ' hundred' + result;
}

export function convertNumberToWords(number: number): string {
  if (number === 0) return 'zero';

  const padded = String(Math.floor(number)).padStart(12, '0');

  const billions = parseInt(padded.slice(0, 3), 10);
  const millions = parseInt(padded.slice(3, 6), 10);
  const hundredThousands = parseInt(padded.slice(6, 9), 10);
  const thousands = parseInt(padded.slice(9, 12), 10);

  const billionsPart = billions === 0 ? '' : convertLessThanOneThousand(billions) + ' billion ';
  const millionsPart = millions === 0 ? '' : convertLessThanOneThousand(millions) + ' million ';
  const hundredThousandsPart =
    hundredThousands === 0 ? '' :
      hundredThousands === 1 ? 'one thousand ' :
        convertLessThanOneThousand(hundredThousands) + ' thousand ';
  const thousandsPart = convertLessThanOneThousand(thousands);

  return (billionsPart + millionsPart + hundredThousandsPart + thousandsPart)
    .trim()
    .replace(/\s{2,}/g, ' ');
}
