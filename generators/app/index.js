'use strict';
const Generator = require('yeoman-generator');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    this.log(
      yosay(`
        WHCG web component folder structure generator
      `)
    );

    const prompts = [
      {
        type: 'input',
        name: 'author',
        message: 'Who is the author??',
        default: 'whcg'
      },
      {
        type: 'input',
        name: 'componentName',
        message: 'What is the component called?',
        default: 'test-element'
      },
      {
        type: 'list',
        name: 'elementType',
        message: 'What is the element type?',
        choices: [
          {
            name: 'Polymer 3',
            value: 'Polymer 3'
          },
          {
            name: 'LitElement',
            value: 'Lit'
          }
        ]
      }
    ];

    const prompts2 = [
      {
        type: 'input',
        name: 'dependency',
        message: 'Enter dependency',
        default: ''
      }
    ];

    let i = 0;

    this.columns = [];

    const loop = prompts => {
      if (i !== 0) {
        return this.prompt(prompts).then(props => {
          this.columns.push(props);
          if (props.dependency !== '') {
            return loop(prompts);
          }
        });
      }

      if (i === 0) {
        i = 1;
        return this.prompt(prompts).then(props => {
          this.props = props;
          return loop(prompts2);
        });
      }
    };
    return loop(prompts);
  }

  writing() {
    this.fs.copyTpl(this.templatePath(), this.destinationPath(), {
      componentName: this.props.componentName,
      author: this.props.author,
      elementType: this.props.elementType
    });

    let testObj = this.columns.reduce((acc, column) => {
      if (column.dependency !== '') {
        acc[column.dependency] = '*';
      }
      return acc;
    }, {});

    if (this.props.elementType === 'Lit') {
      testObj['@polymer/lit-element'] = '*';
    } else {
      testObj['@polymer/polymer'] = '*';
    }

    const pkgJson = {
      devDependencies: testObj,
      dependencies: {}
    };

    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
  }
};
