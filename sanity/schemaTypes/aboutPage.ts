export default {
    name: 'about',
    type: 'document',
    title: '04 - Om oss',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Titel'
        },       
        {
            name: 'ingress',
            type: 'string',
            title: 'Underrubrik'
        },
        {
            name: 'heroImage',
            type: 'image',
            title: 'Bakgrundsbild',
        },        
        {
            name: 'description',
            type: 'array',
            title: 'Text',
            of: [
                {
                    type: 'block',
                }
            ]
        },        
    ]
}