export default (request, response) => {
    if (request.method !== 'GET') {
        response.status(405).end();
        return;
    }
    response.json({
        success: 'ok',
    });
};