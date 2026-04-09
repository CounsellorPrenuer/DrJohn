
const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: '6w0t9e7l',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
    perspective: 'published',
});

async function test() {
    try {
        const data = await client.fetch('*[_type == "hero"][0]');
        console.log('Success:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
