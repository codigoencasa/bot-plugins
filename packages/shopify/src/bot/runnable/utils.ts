export const cleanHtml = (html: string = ''): string => {
    if (!html) return ''
    return html.replace(/<[a-z]*>/, "").replace(/\n/, "").trim()
}