export async function fetchData(resource) {
    try {
        const response = await fetch(`http://localhost:8080/${resource}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Fetch error for resource "${resource}":`, error);
        document.body.innerHTML += `<p>Error: ${error.message}</p>`;
        return [];
    }
}
