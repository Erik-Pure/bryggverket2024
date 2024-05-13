export default {
    name: 'employee',
    type: 'document',
    title: 'Anställda',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Namn'
        },       
        {
            name: 'role',
            type: 'string',
            title: 'Roll'
        },
        {
            name: 'profilePicture',
            type: 'image',
            title: 'Profilbild',
        },                        
    ]
}