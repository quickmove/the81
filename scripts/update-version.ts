import fs from 'fs';
import path from 'path';

const VERSION_FILE = path.join(process.cwd(), 'src', 'components', 'Layout', 'VERSION.ts');

// 读取当前版本号
function getCurrentVersion() {
  try {
    const content = fs.readFileSync(VERSION_FILE, 'utf-8');
    const match = content.match(/VERSION\s*=\s*['"]v?(\d+)\.(\d+)\.(\d+)['"]/);
    if (match) {
      return {
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3])
      };
    }
  } catch (e) {
    // 文件不存在，使用默认值
  }
  return { major: 1, minor: 0, patch: 0 };
}

// 累加 patch 版本号
function incrementVersion() {
  const current = getCurrentVersion();
  current.patch++;

  const newVersion = `v${current.major}.${current.minor}.${current.patch}`;

  const content = `// 自动生成的版本号 - 请勿手动修改
export const VERSION = '${newVersion}';
`;

  fs.writeFileSync(VERSION_FILE, content, 'utf-8');
  console.log(`版本号已更新: ${newVersion}`);
}

incrementVersion();
