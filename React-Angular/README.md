# MLP Framework - Multi-Language Platform

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A framework-agnostic MVVM (Model-View-ViewModel) implementation that works seamlessly with both Angular and React applications. This project demonstrates how to build reusable business logic that can be shared across different frontend frameworks.

## 🏗️ Architecture

The MLP Framework consists of several key components:

### Core Libraries
- **@mlp/core** - Framework-agnostic MVVM implementation with ViewModels, Commands, and State Management
- **@mlp/angular** - Angular-specific bindings and directives
- **@mlp/react** - React-specific hooks and components
- **@mlp/rest-limit-monitor** - Business logic library for API rate limit monitoring

### Applications
- **angular-app** - Angular 20 demonstration application
- **react-app** - React 18 demonstration application

## 🚀 Features

- **Framework Agnostic**: Core business logic works with both Angular and React
- **Reactive State Management**: Built on RxJS for reactive programming
- **Command Pattern**: Implements the command pattern for UI actions
- **Rule Engine**: Automatic rule execution based on model changes
- **State Management**: Multiple state management strategies (In-Memory, Redux-style)
- **Type Safety**: Full TypeScript support with strict typing
- **Error Handling**: Comprehensive error handling and loading states

## 🛠️ Getting Started

### Prerequisites
- Node.js 20.19.0 or higher
- npm 8.0.0 or higher

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

### Running the Applications

#### Angular Application
```bash
npm run dev:angular
# or
npx nx serve angular-app
```
The Angular app will be available at `http://localhost:4200`

#### React Application
```bash
npm run dev:react
# or
npx nx serve react-app
```
The React app will be available at `http://localhost:4201`

### Building the Applications

```bash
# Build all applications
npm run build:all

# Build specific application
npm run build:angular
npm run build:react
```

### Testing

```bash
# Run all tests
npm run test:all

# Run specific tests
npm run test:angular
npm run test:react
```

### Linting

```bash
npm run lint:all
```

## 📚 Usage Examples

### Creating a ViewModel (Angular)

```typescript
import { Component, OnInit } from '@angular/core';
import { AngularViewModelBase } from '@mlp/angular';
import { DelegateCommand } from '@mlp/core';

interface MyModel {
  counter: number;
  message: string;
  isLoading: boolean;
}

@Component({
  selector: 'app-my-component',
  template: `
    <div>
      <p>Count: {{ viewModel.model.counter }}</p>
      <button [disabled]="!incrementCommand.canExecute()" 
              (click)="incrementCommand.execute()">
        Increment
      </button>
    </div>
  `
})
export class MyComponent extends AngularViewModelBase<MyModel> implements OnInit {
  incrementCommand: DelegateCommand;

  constructor() {
    super();
    this.incrementCommand = new DelegateCommand(
      () => this.increment(),
      () => !this.model.isLoading
    );
  }

  protected createModel(): MyModel {
    return { counter: 0, message: '', isLoading: false };
  }

  private increment(): void {
    this.batchUpdate(model => {
      model.counter++;
      model.message = `Count is now ${model.counter}`;
    });
    this.incrementCommand.raiseCanExecuteChanged();
  }
}
```

### Creating a ViewModel (React)

```typescript
import React from 'react';
import { ReactViewModelBase } from '@mlp/react';
import { DelegateCommand } from '@mlp/core';

interface MyModel {
  counter: number;
  message: string;
  isLoading: boolean;
}

class MyViewModel extends ReactViewModelBase<MyModel> {
  incrementCommand: DelegateCommand;

  constructor() {
    super();
    this.incrementCommand = new DelegateCommand(
      () => this.increment(),
      () => !this.model.isLoading
    );
  }

  protected createModel(): MyModel {
    return { counter: 0, message: '', isLoading: false };
  }

  private increment(): void {
    this.batchUpdate(model => {
      model.counter++;
      model.message = `Count is now ${model.counter}`;
    });
    this.incrementCommand.raiseCanExecuteChanged();
  }
}

const MyComponent: React.FC = () => {
  const [viewModel] = React.useState(() => new MyViewModel());
  const { model, incrementCommand } = viewModel;

  React.useEffect(() => {
    viewModel.useInitialization();
    return () => viewModel.useCleanup();
  }, [viewModel]);

  return (
    <div>
      <p>Count: {model.counter}</p>
      <button disabled={!incrementCommand.canExecute()} 
              onClick={() => incrementCommand.execute()}>
        Increment
      </button>
    </div>
  );
};
```

## 🔧 Development

### Project Structure
```
├── apps/
│   ├── angular-app/          # Angular demonstration app
│   └── react-app/            # React demonstration app
├── libs/
│   ├── core/                 # Core MVVM framework
│   ├── angular/              # Angular bindings
│   ├── react/                # React bindings
│   └── rest-limit-monitor/   # Business logic example
└── packages/                 # Published packages
```

### Adding New Libraries

```bash
# Generate a new library
npx nx g @nx/js:lib libs/my-new-lib --publishable --importPath=@mlp/my-new-lib
```

## 📄 License

MIT License - see LICENSE file for details.

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
