/*    import { readdir } from 'fs/promises';
    import { pathToFileURL } from 'url';
    import path from 'path';

    export async function loadPrefixCommands() {
    const commands = new Map();
    const commandsPath = path.join(process.cwd(), 'prefix-commands');
    const commandFiles = await readdir(commandsPath);

    for (const file of commandFiles) {
        if (file.endsWith('.js')) {
        const filePath = pathToFileURL(path.join(commandsPath, file)).href;
        const command = (await import(filePath)).default;
        commands.set(command.name.toLowerCase(), command);
        }
    }

    return commands;
    }
*/