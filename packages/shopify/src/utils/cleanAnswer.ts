export const cleanAnswer = (answer: string): string => {
    let content: any = answer
    
    if (content.includes("```json")) {
        content = content
          .replace(/(```json|```)/gim, '').split('\n')
          .filter(Boolean)
          .map(e => e.trim().split(/^[a-z]*:/gim).join('').trim())
        content = {
            answer: content[0].replace(/\[(\w|\s|\W)*\]/g, '')
              .replace(/(!|\(|\))/g, ''),
            media: content[1].split(' ').length ? content[1] : ''
        }
        content = Object.values(content).filter((t: string) => t.length > 3).join(' ')
      }else {
        content
        .replace(/\[(\w|\s|\W)*\]/g, '')
        .replace(/(!|\(|\))/g, '')
        .trim()
      }

    return content
} 