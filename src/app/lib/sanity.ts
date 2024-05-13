import { createClient } from "next-sanity"
import imageUrlBuilder from  "@sanity/image-url";

export const client = createClient({
    apiVersion: '2024-05-11',
    dataset: 'production',
    projectId: 'b0e19xpn',
    useCdn: false,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source);
}