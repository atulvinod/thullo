import { useEffect } from "react"

/**
 * 
 * @param {Array<string>} page_title_components 
 * @param {Array<any>} dep_array 
 */
export const useSetPageTitle = (page_title_components = [], dep_array = []) => {

    useEffect(() => {
        const title = page_title_components.join(' | ')
        document.title = 'Th ' + title
    }, dep_array)
}