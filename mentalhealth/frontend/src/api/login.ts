interface ApiResponse {
    message: string;
    isAdmin: boolean;
    university: string;
    token: string;
  }
  
  export async function saveLoginData(data: { email: string; password: string }): Promise<ApiResponse> {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error('Invalid credentials.');
    }
  
    return response.json();
}

interface RegisterFormData {
    email: string;
    password: string;
    university: string;
    isAdmin: boolean;
}

export async function registerUser(data: RegisterFormData): Promise<ApiResponse> {
    try {
        const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            email: data.email.trim(),
            password: data.password.trim(),
            university: data.university.trim(),
            isAdmin: Boolean(data.isAdmin)
        }),
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register user.');
        }

        return response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

export async function deleteUser(email: string): Promise<ApiResponse> {
    try {
        const response = await fetch(`http://localhost:8000/api/deleteUser?email=${encodeURIComponent(email.trim())}`, {
        method: 'DELETE',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete user.');
        }

        return response.json();
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

