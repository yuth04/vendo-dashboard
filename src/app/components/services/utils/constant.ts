import { HttpMethod, Models } from './models';

const postHeaders: Models = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
};

const headerHelpers = {
    contentType: { 'Content-Type': 'application/json' },
    // add more header
};

const http: Record<string, HttpMethod> = {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE',
};

export { postHeaders, headerHelpers, http };
