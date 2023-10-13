/**
 * Makes sure the response is not an error response and parses it as an XML (all responses from HiLink API are XML)
 */
export async function handleResponse(response: Response) {
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const document = new DOMParser().parseFromString(await response.text(), "application/xml");
    const errorNode = document.querySelector("parsererror");
    if (errorNode) {
        throw new Error(errorNode.textContent ? errorNode.textContent : "Parsing error");
    }

    return document;
}
