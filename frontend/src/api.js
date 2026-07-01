export const uploadFile = async (file, targetFormat) => {
    const formData = new FormData();
    formData.append('userFile', file);
    formData.append('targetFormat', targetFormat.toLowerCase());

    // Explicitly hit the IPv4 direct address loop
    const response = await fetch('http://127.0.0.1:3000/api/convert', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server responded with an error status.');
    }

    return await response.json();
};