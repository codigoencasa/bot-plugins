export const cleanHtml = (html: string = ''): string => {
    if (!html) return '';
    const cleanedHtml = html.replace(/<\/?[^>]+(>|$)/g, '').replace(/\n/g, '');
    const formattedText = cleanedHtml.replace(/<(b|i|u|strong|em)>/g, '').replace(/<\/(b|i|u|strong|em)>/g, '');
    return formattedText.trim();
}