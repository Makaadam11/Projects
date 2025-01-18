# Mental Health Project

## Introduction
This project aims to provide resources and tools to support mental health.

## Prerequisites
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (version 6 or higher)
- [Python](https://www.python.org/) (version 3.8 or higher)
- [pip](https://pip.pypa.io/en/stable/)

## Installation

### Backend
1. Clone the repository (to view code only):
    ```sh
    git clone https://github.com/Makaadam11/Projects.git
    ```
2. Navigate to the project directory backend:
    ```sh
    cd mentalhealth/backend
    ```
3. Create a virtual environment:
    ```sh
    python -m venv venv
    ```
4. Activate the virtual environment:
    - On Windows:
        ```sh
        .\venv\Scripts\activate
        ```
    - On macOS/Linux:
        ```sh
        source venv/bin/activate
        ```
5. Install the dependencies:
    ```sh
    pip install -r requirements.txt
    ```
6. Set the Groq AI model authentication key:
    - On Windows:
        ```sh
        set GROQ_API_KEY="gsk..."
        ```
    - On macOS/Linux:
        ```sh
        export GROQ_API_KEY="gsk..."
        ```
7. Run the backend:
    ```sh
    uvicorn api:app --reload
    ```

### Frontend
1. Navigate to the project directory frontend:
    ```sh
    cd ../frontend
    ```
2. Install the dependencies:
    ```sh
    npm install or npm install --legacy-peer-deps
    ```
3. Run the frontend:
    ```sh
    npm run dev
    ```

## Running the Project
To start the project, follow the instructions in the Installation section to run both the backend and frontend.

## Contributing
We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For any questions or feedback, please contact us at [email@example.com](mailto:email@example.com).