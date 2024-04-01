const img_re = /(http|https)?:\/\/\S+?\.(?:jpg|jpeg|png|gif)(\?.*)?$/gim
const link_re = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/gim


export const isImg = (content: string) => {
    if (img_re.test(content)) {
        return {
            image: content.match(img_re),
            content: content.replace(img_re, '').split(/(?<!\d)\.\s+/g)
        }
    }

    return {
        image: null,
        content: content.split(/(?<!\d)\.\s+/g)
    }
}

export const isLink = (content: string) => {

    if (link_re.test(content) && !img_re.test(content)) {
        return {
            link: content.match(link_re),
            content: content.replace(link_re, '').split(/(?<!\d)\.\s+/g)
        }
    }

    return {
        link: null,
        content: content.split(/(?<!\d)\.\s+/g)
    }
}