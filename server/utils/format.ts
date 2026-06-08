export const formatPrice = (value: any): string => {
  if (value === undefined || value === null || value === '') return '0,00 ₺'
  
  // Para birimi ve boşlukları temizle
  let cleanValue = String(value).replace(/[₺TL\s]/g, '');
  
  // ANALİZ VE DÜZENLEME
  if (cleanValue.includes('.') && cleanValue.includes(',')) {
    // Örn: 1.250,50 -> 1250.50 (Noktaları sil, virgülü noktaya çevir)
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } 
  else if (cleanValue.includes(',')) {
    // Örn: 350,50 -> 350.50
    cleanValue = cleanValue.replace(',', '.');
  } 
  else if (cleanValue.includes('.')) {
    // Örn: 36.000 veya 36.50
    // Regex Kontrolü: Eğer nokta en sonda değilse ve noktadan sonra tam 2 rakam yoksa binliktir.
    // 36.000 (3 rakam var) -> Noktayı sil
    // 36.50 (2 rakam var) -> Noktaya dokunma
    const isDecimal = /\.\d{2}$/.test(cleanValue);
    if (!isDecimal) {
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }

  const numericValue = parseFloat(cleanValue);

  // Formatlama
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(isNaN(numericValue) ? 0 : numericValue);
}