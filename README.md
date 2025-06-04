# ProfOMeter - Professor Rating Platform

![MIT License](https://img.shields.io/badge/license-MIT-blue) [![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://typescriptlang.org) ![ESLint](https://img.shields.io/badge/code%20style-eslint-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue)

## 📚 About ProfOMeter

ProfOMeter is a specialized platform designed to help students make informed decisions about their education through transparent professor reviews and ratings. The platform serves as a community-driven resource where students can share their experiences and insights about professors and courses.

### 🎯 Core Features

- **Professor Reviews & Ratings**
  - Comprehensive rating system for professors
  - Detailed reviews covering teaching style, course difficulty, and overall experience
  - Department-specific rankings and statistics
  - Recently reviewed professors section
  - Featured professors (both loved and challenging)

- **Course Information**
  - Course-specific reviews and ratings
  - Department-wise course listings
  - Course difficulty and workload insights
  - Integration with professor reviews

- **Department Rankings**
  - Department-wise performance metrics
  - Average ratings by department
  - Number of professors and courses per department
  - Department-specific statistics

- **User Features**
  - Secure authentication using IITBHU Google ID
  - Personalized profile management
  - Review management system
  - Ability to write and edit reviews
  - Track review history and helpfulness

### 💫 Core Values

1. **Transparency**
   - Open and honest communication about educational experiences
   - Clear rating and review system

2. **Fairness**
   - Balanced and constructive feedback
   - Moderation system to ensure review quality

3. **Privacy**
   - Anonymous review options
   - User data protection
   - Secure authentication

4. **Community**
   - Supportive environment for students and educators
   - Community-driven content
   - Collaborative improvement of educational experiences

## 🚀 Technical Stack

- **Frontend Framework**: Next.js 15
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI
- **Code Quality**:
  - ESLint 9
  - Prettier 3
  - TypeScript 5
- **Containerization**: Docker with Node.js 22.14.0 (Alpine) or Bun 1.2.8 (Alpine)

### 🛠️ Development Tools

#### ESLint Plugins
- [**@eslint/js**](https://www.npmjs.com/package/@eslint/js)
- [**typescript-eslint**](https://github.com/typescript-eslint/typescript-eslint)
- [**eslint-plugin-react**](https://github.com/jsx-eslint/eslint-plugin-react)
- [**@next/eslint-plugin-next**](https://github.com/vercel/next.js)
- [**eslint-config-prettier**](eslint-config-prettier)
- [**eslint-plugin-tailwindcss**](https://github.com/francoismassart/eslint-plugin-tailwindcss)
- [**eslint-plugin-import**](https://github.com/import-js/eslint-plugin-import)
- [**eslint-plugin-promise**](https://github.com/eslint-community/eslint-plugin-promise)

#### Prettier Plugins
- [**@trivago/prettier-plugin-sort-imports**](https://github.com/trivago/prettier-plugin-sort-imports)
- [**prettier-plugin-tailwindcss**](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)

### 💻 Recommended VS Code Extensions

- [**Auto Close Tag**](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)
- [**Better Comments**](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)
- [**DotENV**](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv)
- [**EditorConfig for VS Code**](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [**ESLint**](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [**formate: CSS/LESS/SCSS formatter**](https://marketplace.visualstudio.com/items?itemName=MikeBovenlander.formate)
- [**Git History**](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory)
- [**Import Cost**](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost)
- [**JavaScript Booster**](https://marketplace.visualstudio.com/items?itemName=sburg.vscode-javascript-booster)
- [**npm Intellisense**](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense)
- [**Prettier - Code formatter**](https://marketplace.visualstudio.com/items?itemName=esbenp)
- [**Todo Tree**](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)
- [**Turbo Console Log**](https://marketplace.visualstudio.com/items?itemName=ChakrounAnas.turbo-console-log)
- [**Package Json Upgrade**](https://marketplace.visualstudio.com/items?itemName=codeandstuff.package-json-upgrade)
- [**Visual Studio Code Commitizen Support**](https://marketplace.visualstudio.com/items?itemName=KnisterPeter.vscode-commitizen)
- [**Markdown All in One**](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)

## 🏁 Getting Started

### Prerequisites

- **Bun**: Version 1.2.8 or higher OR
- **Node.js**: Version 20.18.0 or higher
- **Docker**: For containerized deployment (optional but recommended)

### Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/rateThatProf.git
    cd rateThatProf
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Run Development Server**:
    ```bash
    npm run dev
    ```

4. **Build for Production**:
    ```bash
    npm run build
    ```

5. **Prisma Migration**:
    ```bash
    npx prisma migrate dev --name NAME_HERE
    ```

### 🐳 Docker Setup

To use Docker, make sure Docker is installed on your machine. Then, build and run the Docker container:

```bash
docker build . -t profometer
# or if using Bun
docker build . -t profometer -f Dockerfile.bun

docker run -p 3000:3000 profometer
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p style="text-align: center;"> Made with ❤️ for IITBHU Students </p>
