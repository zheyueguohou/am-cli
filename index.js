#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const handlebars = require('handlebars');
const chalk = require('chalk');
const ora = require('ora');
const symbols = require('log-symbols');

function successFunc(spinner, name, answers) {
    spinner.succeed();
    const meta = {
        name,
        description: answers.description,
        author: answers.author
    }
    const fileName = `${name}/package.json`;
    if (fs.existsSync(fileName)) {
        const content = fs.readFileSync(fileName).toString();
        const result = handlebars.compile(content)(meta);
        fs.writeFileSync(fileName, result);
    }
    console.log(symbols.success, chalk.green('项目初始化完成'));
}

function failFunc(spinner, err) {
    console.log(err);
    spinner.fail();
    console.log(symbols.error, chalk.red(err));
}

program.version('1.0.4', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if (!fs.existsSync(name)) {
            inquirer.prompt([{
                    name: 'description',
                    message: '请输入项目描述'
                },
                {
                    name: 'author',
                    message: '请输入作者名称'
                }
            ]).then((answers) => {
                const spinner = ora('正在下载模板...');
                spinner.start();
                download('https://github.com:zheyueguohou/am-cli-template#master', name, { clone: true }, (err) => {
                    if (err) {
                        spinner.color = 'yellow';
                        spinner.text = '切换ssh方式下载';
			// 默认为 git@github.com:zheyueguohou/am-cli.git
                        download('github.com:zheyueguohou/am-cli-template#master', name, { clone: true }, (err) => {
                            if (err) {
                                failFunc(spinner, err);
                            } else {
                                successFunc(spinner, name, answers);
                            }
                        });
                    } else {
                        successFunc(spinner, name, answers);
                    }
                })
            })
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目名称已存在'));
        }
    });
program.parse(process.argv);
