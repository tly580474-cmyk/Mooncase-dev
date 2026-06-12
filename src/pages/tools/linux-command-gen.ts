import { icon } from '../../core/icons';
import { showToast } from '../../core/toast';

type RiskLevel = 'safe' | 'caution' | 'danger';

interface CommandVariant {
  name: string;
  template: string;
  note: string;
  fields?: Record<string, string>;
}

interface CommandEntry {
  id: string;
  command: string;
  category: string;
  description: string;
  risk: RiskLevel;
  examples: string[];
  variants: CommandVariant[];
}

const CATEGORIES = [
  '文件与目录',
  '查看文件',
  '文本处理',
  '权限管理',
  '压缩归档',
  '进程管理',
  '系统信息',
  '网络相关',
  '用户管理',
  '软件包管理',
  '磁盘挂载',
  'Shell 操作',
];

const COMMANDS: CommandEntry[] = [
  command('ls', '文件与目录', '列出目录内容', 'safe', ['ls -l', 'ls -a', 'ls -lh'], [
    variant('长格式列表', 'ls -lh {path}', '按人类可读大小显示目录内容', { path: '目录路径，默认 .' }),
    variant('包含隐藏文件', 'ls -la {path}', '显示隐藏文件和详细信息', { path: '目录路径，默认 .' }),
  ]),
  command('cd', '文件与目录', '切换工作目录', 'safe', ['cd /path', 'cd ..', 'cd -'], [
    variant('切换目录', 'cd {path}', '进入指定目录', { path: '目标目录' }),
    variant('返回上级目录', 'cd ..', '进入上一级目录'),
  ]),
  command('pwd', '文件与目录', '显示当前目录的绝对路径', 'safe', ['pwd'], [
    variant('显示当前路径', 'pwd', '输出当前工作目录'),
  ]),
  command('mkdir', '文件与目录', '创建目录', 'safe', ['mkdir dir', 'mkdir -p a/b/c'], [
    variant('创建目录', 'mkdir {dir}', '创建单层目录', { dir: '目录名' }),
    variant('递归创建目录', 'mkdir -p {dir}', '自动创建缺失的父目录', { dir: '目录路径' }),
  ]),
  command('rmdir', '文件与目录', '删除空目录', 'caution', ['rmdir emptydir'], [
    variant('删除空目录', 'rmdir {dir}', '只删除空目录', { dir: '空目录路径' }),
  ]),
  command('rm', '文件与目录', '删除文件或目录', 'danger', ['rm file', 'rm -r dir', 'rm -f file'], [
    variant('删除文件', 'rm {path}', '删除指定文件', { path: '文件路径' }),
    variant('递归删除目录', 'rm -r {path}', '删除目录及其内容，请确认路径', { path: '目录路径' }),
    variant('强制删除', 'rm -f {path}', '忽略不存在文件并强制删除', { path: '文件路径' }),
  ]),
  command('cp', '文件与目录', '复制文件或目录', 'safe', ['cp src dest', 'cp -r dir dest'], [
    variant('复制文件', 'cp {source} {target}', '复制文件到目标路径', { source: '源文件', target: '目标路径' }),
    variant('复制目录', 'cp -r {source} {target}', '递归复制目录', { source: '源目录', target: '目标路径' }),
  ]),
  command('mv', '文件与目录', '移动或重命名', 'caution', ['mv old new', 'mv file /path/'], [
    variant('移动或重命名', 'mv {source} {target}', '移动文件，目标为同目录新名称时即重命名', { source: '源路径', target: '目标路径' }),
  ]),
  command('touch', '文件与目录', '创建空文件或更新时间戳', 'safe', ['touch newfile.txt'], [
    variant('创建或更新时间戳', 'touch {file}', '文件不存在时创建空文件', { file: '文件路径' }),
  ]),
  command('ln', '文件与目录', '创建链接', 'safe', ['ln -s target linkname', 'ln target hardlink'], [
    variant('创建软链接', 'ln -s {target} {link}', '创建符号链接', { target: '原始路径', link: '链接名' }),
    variant('创建硬链接', 'ln {target} {link}', '创建硬链接', { target: '原始文件', link: '链接名' }),
  ]),
  command('find', '文件与目录', '搜索文件', 'safe', ['find . -name "*.log"', 'find / -size +100M'], [
    variant('按名称搜索', 'find {path} -name "{pattern}"', '按文件名模式搜索', { path: '搜索目录，默认 .', pattern: '名称模式，如 *.log' }),
    variant('按大小搜索', 'find {path} -size {size}', '查找超过或小于指定大小的文件', { path: '搜索目录', size: '大小条件，如 +100M' }),
  ]),
  command('locate', '文件与目录', '快速定位文件', 'safe', ['locate filename'], [
    variant('定位文件', 'locate {keyword}', '基于索引快速查找路径', { keyword: '文件名关键词' }),
  ]),

  command('cat', '查看文件', '输出文件全部内容', 'safe', ['cat file.txt', 'cat f1 f2 > merged'], [
    variant('查看文件', 'cat {file}', '输出完整文件内容', { file: '文件路径' }),
    variant('合并文件', 'cat {files} > {target}', '将多个文件合并输出到目标文件', { files: '源文件列表', target: '目标文件' }),
  ]),
  command('tac', '查看文件', '反向输出文件内容', 'safe', ['tac file.txt'], [
    variant('反向查看', 'tac {file}', '从最后一行开始输出', { file: '文件路径' }),
  ]),
  command('more', '查看文件', '分页查看文件', 'safe', ['more longfile.txt'], [
    variant('分页查看', 'more {file}', '向前分页查看长文件', { file: '文件路径' }),
  ]),
  command('less', '查看文件', '可前后翻页查看文件', 'safe', ['less longfile.txt'], [
    variant('分页查看', 'less {file}', '支持前后翻页和搜索', { file: '文件路径' }),
  ]),
  command('head', '查看文件', '查看文件前几行', 'safe', ['head -n 20 file'], [
    variant('查看前 N 行', 'head -n {lines} {file}', '输出文件开头指定行数', { lines: '行数', file: '文件路径' }),
  ]),
  command('tail', '查看文件', '查看文件末尾或实时跟踪', 'safe', ['tail -f /var/log/syslog'], [
    variant('查看末尾 N 行', 'tail -n {lines} {file}', '输出文件末尾指定行数', { lines: '行数', file: '文件路径' }),
    variant('实时跟踪日志', 'tail -f {file}', '持续显示新增内容', { file: '日志文件路径' }),
  ]),
  command('nl', '查看文件', '带行号显示文件', 'safe', ['nl file.txt'], [
    variant('带行号显示', 'nl {file}', '给文本行添加行号', { file: '文件路径' }),
  ]),

  command('grep', '文本处理', '搜索文本匹配行', 'safe', ['grep "error" file.log', 'grep -r "pattern" dir/', 'grep -v "exclude"'], [
    variant('搜索文件', 'grep "{keyword}" {file}', '在文件中搜索关键词', { keyword: '关键词', file: '文件路径' }),
    variant('递归搜索目录', 'grep -r "{keyword}" {path}', '在目录下递归搜索', { keyword: '关键词', path: '目录路径' }),
    variant('排除匹配行', 'grep -v "{keyword}" {file}', '输出不包含关键词的行', { keyword: '排除关键词', file: '文件路径' }),
  ]),
  command('sed', '文本处理', '流编辑器，查找替换', 'caution', ["sed 's/old/new/g' file", "sed -i 's/foo/bar/' file"], [
    variant('预览替换', "sed 's/{old}/{new}/g' {file}", '输出替换后的结果，不修改原文件', { old: '旧文本', new: '新文本', file: '文件路径' }),
    variant('原地替换', "sed -i 's/{old}/{new}/g' {file}", '直接修改文件，请先备份', { old: '旧文本', new: '新文本', file: '文件路径' }),
  ]),
  command('awk', '文本处理', '文本分析和字段处理', 'safe', ["awk '{print $1,$3}' file", "awk -F: '{print $1}' /etc/passwd"], [
    variant('打印字段', "awk '{print {fields}}' {file}", '按空白分隔并打印字段', { fields: '字段表达式，如 $1,$3', file: '文件路径' }),
    variant('指定分隔符', "awk -F'{separator}' '{print {fields}}' {file}", '按指定分隔符处理字段', { separator: '分隔符，如 :', fields: '字段表达式，如 $1', file: '文件路径' }),
  ]),
  command('cut', '文本处理', '按列截取文本', 'safe', ['cut -d: -f1 /etc/passwd'], [
    variant('按分隔符截取', 'cut -d"{delimiter}" -f{field} {file}', '截取指定字段', { delimiter: '分隔符', field: '字段序号', file: '文件路径' }),
  ]),
  command('sort', '文本处理', '排序文本行', 'safe', ['sort file', 'sort -n file', 'sort -r file'], [
    variant('普通排序', 'sort {file}', '按字典序排序', { file: '文件路径' }),
    variant('数字排序', 'sort -n {file}', '按数字大小排序', { file: '文件路径' }),
    variant('逆序排序', 'sort -r {file}', '逆序输出', { file: '文件路径' }),
  ]),
  command('uniq', '文本处理', '去重相邻重复行', 'safe', ['sort file | uniq', 'uniq -c file'], [
    variant('排序后去重', 'sort {file} | uniq', '先排序再去重', { file: '文件路径' }),
    variant('统计重复次数', 'sort {file} | uniq -c', '输出每行出现次数', { file: '文件路径' }),
  ]),
  command('wc', '文本处理', '统计行数、单词数、字节数', 'safe', ['wc -l file'], [
    variant('统计行数', 'wc -l {file}', '输出文件行数', { file: '文件路径' }),
    variant('完整统计', 'wc {file}', '输出行数、单词数、字节数', { file: '文件路径' }),
  ]),
  command('tr', '文本处理', '字符替换或删除', 'safe', ['echo "abc" | tr \'a-z\' \'A-Z\''], [
    variant('转大写', 'echo "{text}" | tr \'a-z\' \'A-Z\'', '将小写字母转换为大写', { text: '输入文本' }),
    variant('删除字符', 'echo "{text}" | tr -d "{chars}"', '删除指定字符集合', { text: '输入文本', chars: '要删除的字符' }),
  ]),
  command('diff', '文本处理', '比较文件差异', 'safe', ['diff file1 file2'], [
    variant('比较两个文件', 'diff {left} {right}', '输出两个文件的差异', { left: '文件一', right: '文件二' }),
  ]),
  command('patch', '文本处理', '应用补丁文件', 'caution', ['patch < file.patch'], [
    variant('应用补丁', 'patch < {patchFile}', '将补丁应用到当前目录', { patchFile: '补丁文件' }),
  ]),

  command('chmod', '权限管理', '修改文件权限', 'caution', ['chmod 755 script.sh', 'chmod u+x file'], [
    variant('设置数字权限', 'chmod {mode} {path}', '设置八进制权限', { mode: '权限，如 755', path: '文件或目录' }),
    variant('添加可执行权限', 'chmod u+x {path}', '给所有者添加执行权限', { path: '文件路径' }),
  ]),
  command('chown', '权限管理', '修改文件所有者', 'caution', ['chown user:group file'], [
    variant('修改所有者和组', 'chown {owner}:{group} {path}', '更改文件所属用户和用户组', { owner: '用户', group: '用户组', path: '文件或目录' }),
  ]),
  command('chgrp', '权限管理', '修改文件所属组', 'caution', ['chgrp group file'], [
    variant('修改所属组', 'chgrp {group} {path}', '更改文件所属用户组', { group: '用户组', path: '文件或目录' }),
  ]),
  command('umask', '权限管理', '设置默认权限掩码', 'safe', ['umask 022'], [
    variant('设置掩码', 'umask {mask}', '设置当前 shell 的默认权限掩码', { mask: '掩码，如 022' }),
  ]),

  command('tar', '压缩归档', '打包或解包 tar 归档', 'safe', ['tar -czvf archive.tar.gz dir/', 'tar -xzvf archive.tar.gz'], [
    variant('打包为 tar.gz', 'tar -czvf {archive} {source}', '压缩目录或文件为 gzip tar 包', { archive: '归档名，如 archive.tar.gz', source: '源目录或文件' }),
    variant('解压 tar.gz', 'tar -xzvf {archive}', '解压 gzip tar 包到当前目录', { archive: '归档文件' }),
  ]),
  command('gzip', '压缩归档', '压缩为 .gz 文件', 'safe', ['gzip file'], [
    variant('压缩文件', 'gzip {file}', '生成 .gz 并默认移除原文件', { file: '文件路径' }),
  ]),
  command('gunzip', '压缩归档', '解压 .gz 文件', 'safe', ['gunzip file.gz'], [
    variant('解压文件', 'gunzip {file}', '解压 .gz 文件', { file: 'gz 文件路径' }),
  ]),
  command('bzip2', '压缩归档', '压缩为 .bz2 文件', 'safe', ['bzip2 file'], [
    variant('压缩文件', 'bzip2 {file}', '生成 .bz2 并默认移除原文件', { file: '文件路径' }),
  ]),
  command('bunzip2', '压缩归档', '解压 .bz2 文件', 'safe', ['bunzip2 file.bz2'], [
    variant('解压文件', 'bunzip2 {file}', '解压 .bz2 文件', { file: 'bz2 文件路径' }),
  ]),
  command('zip', '压缩归档', 'ZIP 压缩', 'safe', ['zip -r archive.zip dir/'], [
    variant('递归压缩目录', 'zip -r {archive} {source}', '将目录压缩为 zip 文件', { archive: '归档名，如 archive.zip', source: '源目录' }),
  ]),
  command('unzip', '压缩归档', 'ZIP 解压', 'safe', ['unzip archive.zip'], [
    variant('解压 zip', 'unzip {archive}', '解压 zip 文件到当前目录', { archive: 'zip 文件路径' }),
  ]),

  command('ps', '进程管理', '查看进程快照', 'safe', ['ps aux', 'ps -ef'], [
    variant('BSD 风格进程列表', 'ps aux', '显示所有进程详情'),
    variant('标准全格式列表', 'ps -ef', '显示完整格式进程列表'),
  ]),
  command('top', '进程管理', '动态监控进程', 'safe', ['top'], [
    variant('启动 top', 'top', '实时查看进程和系统负载'),
  ]),
  command('htop', '进程管理', '交互式进程监控', 'safe', ['htop'], [
    variant('启动 htop', 'htop', '更友好的实时进程界面'),
  ]),
  command('kill', '进程管理', '按 PID 发送信号', 'danger', ['kill PID', 'kill -9 PID'], [
    variant('正常终止', 'kill {pid}', '向进程发送 SIGTERM', { pid: '进程 PID' }),
    variant('强制终止', 'kill -9 {pid}', '向进程发送 SIGKILL，无法清理资源', { pid: '进程 PID' }),
  ]),
  command('pkill', '进程管理', '按名称终止进程', 'danger', ['pkill -f process_name'], [
    variant('按命令行匹配终止', 'pkill -f {name}', '匹配完整命令行并终止进程', { name: '进程名或关键词' }),
  ]),
  command('nice', '进程管理', '以指定优先级启动进程', 'safe', ['nice -n 10 command'], [
    variant('低优先级启动', 'nice -n {level} {command}', '以指定 nice 值启动命令', { level: 'nice 值，如 10', command: '要执行的命令' }),
  ]),
  command('renice', '进程管理', '调整已有进程优先级', 'caution', ['renice -n 5 -p PID'], [
    variant('调整进程优先级', 'renice -n {level} -p {pid}', '修改已有进程的 nice 值', { level: 'nice 值', pid: '进程 PID' }),
  ]),
  command('jobs', '进程管理', '查看后台作业', 'safe', ['jobs -l'], [
    variant('查看后台作业', 'jobs -l', '列出当前 shell 的后台作业和 PID'),
  ]),
  command('fg', '进程管理', '将作业调至前台', 'safe', ['fg %1'], [
    variant('切到前台', 'fg %{job}', '恢复指定作业到前台', { job: '作业号，如 1' }),
  ]),
  command('bg', '进程管理', '将作业调至后台继续运行', 'safe', ['bg %1'], [
    variant('后台继续运行', 'bg %{job}', '让暂停的作业在后台继续执行', { job: '作业号，如 1' }),
  ]),
  command('nohup', '进程管理', '后台运行不挂断', 'safe', ['nohup command &'], [
    variant('后台运行', 'nohup {command} &', '退出终端后继续运行命令', { command: '要执行的命令' }),
  ]),

  command('uname', '系统信息', '显示系统信息', 'safe', ['uname -a'], [
    variant('完整系统信息', 'uname -a', '输出内核、主机和架构信息'),
  ]),
  command('hostname', '系统信息', '显示主机名', 'safe', ['hostname'], [
    variant('显示主机名', 'hostname', '输出当前主机名'),
  ]),
  command('uptime', '系统信息', '运行时间与负载', 'safe', ['uptime'], [
    variant('显示运行时间', 'uptime', '查看运行时长、登录用户数和负载'),
  ]),
  command('whoami', '系统信息', '显示当前用户名', 'safe', ['whoami'], [
    variant('当前用户', 'whoami', '输出当前有效用户名'),
  ]),
  command('who', '系统信息', '当前登录用户', 'safe', ['who'], [
    variant('登录用户', 'who', '列出当前登录用户'),
  ]),
  command('w', '系统信息', '登录用户和活动', 'safe', ['w'], [
    variant('登录用户活动', 'w', '显示登录用户及其正在运行的命令'),
  ]),
  command('id', '系统信息', '用户 ID 与组信息', 'safe', ['id username'], [
    variant('查看用户 ID', 'id {user}', '显示用户 UID、GID 和组', { user: '用户名' }),
  ]),
  command('df', '系统信息', '磁盘空间使用情况', 'safe', ['df -h'], [
    variant('人类可读磁盘空间', 'df -h', '查看文件系统空间使用情况'),
  ]),
  command('du', '系统信息', '目录或文件大小', 'safe', ['du -sh dir/'], [
    variant('汇总目录大小', 'du -sh {path}', '汇总显示指定路径占用空间', { path: '目录或文件路径' }),
  ]),
  command('free', '系统信息', '内存使用情况', 'safe', ['free -h'], [
    variant('人类可读内存', 'free -h', '查看内存和 swap 使用情况'),
  ]),
  command('lscpu', '系统信息', 'CPU 信息', 'safe', ['lscpu'], [
    variant('查看 CPU', 'lscpu', '输出 CPU 架构和核心信息'),
  ]),
  command('lsblk', '系统信息', '块设备列表', 'safe', ['lsblk'], [
    variant('查看块设备', 'lsblk', '列出磁盘和分区'),
  ]),
  command('dmesg', '系统信息', '内核环缓冲区消息', 'safe', ['dmesg | tail'], [
    variant('查看最近内核消息', 'dmesg | tail', '查看内核日志末尾内容'),
  ]),

  command('ping', '网络相关', '测试网络连通性', 'safe', ['ping -c 4 google.com'], [
    variant('Ping 指定次数', 'ping -c {count} {host}', '发送指定次数 ICMP 请求', { count: '次数', host: '主机或 IP' }),
  ]),
  command('ip', '网络相关', '显示或管理网络接口', 'caution', ['ip addr', 'ip link set dev eth0 up'], [
    variant('查看地址', 'ip addr', '显示网络接口地址'),
    variant('启用网卡', 'ip link set dev {device} up', '启用指定网络接口', { device: '网卡名，如 eth0' }),
  ]),
  command('ss', '网络相关', '查看网络连接', 'safe', ['ss -tuln'], [
    variant('查看监听端口', 'ss -tuln', '显示监听中的 TCP/UDP 端口'),
  ]),
  command('curl', '网络相关', '传输数据或调试 HTTP', 'safe', ['curl -O https://example.com/file', 'curl -I URL'], [
    variant('查看响应头', 'curl -I {url}', '只请求 HTTP 响应头', { url: 'URL' }),
    variant('下载文件', 'curl -O {url}', '使用远端文件名下载', { url: '文件 URL' }),
  ]),
  command('wget', '网络相关', '下载工具', 'safe', ['wget URL', 'wget -r -np URL'], [
    variant('下载 URL', 'wget {url}', '下载单个 URL', { url: 'URL' }),
    variant('递归下载', 'wget -r -np {url}', '递归下载且不进入父目录', { url: 'URL' }),
  ]),
  command('ssh', '网络相关', '远程登录', 'safe', ['ssh user@host'], [
    variant('远程登录', 'ssh {user}@{host}', '登录远程主机', { user: '用户名', host: '主机名或 IP' }),
    variant('指定端口登录', 'ssh -p {port} {user}@{host}', '通过指定端口连接', { port: '端口', user: '用户名', host: '主机名或 IP' }),
  ]),
  command('scp', '网络相关', '远程文件复制', 'safe', ['scp file user@host:/path'], [
    variant('上传文件', 'scp {file} {user}@{host}:{remotePath}', '复制本地文件到远程主机', { file: '本地文件', user: '用户名', host: '主机', remotePath: '远程路径' }),
  ]),
  command('rsync', '网络相关', '同步文件', 'safe', ['rsync -avz source/ dest/'], [
    variant('同步目录', 'rsync -avz {source} {target}', '归档模式压缩同步目录', { source: '源路径', target: '目标路径' }),
  ]),
  command('traceroute', '网络相关', '跟踪路由路径', 'safe', ['traceroute host'], [
    variant('跟踪主机', 'traceroute {host}', '显示到目标主机的路由路径', { host: '主机名或 IP' }),
  ]),
  command('dig', '网络相关', 'DNS 查询', 'safe', ['dig example.com'], [
    variant('查询域名', 'dig {domain}', '查询域名 DNS 记录', { domain: '域名' }),
  ]),
  command('nslookup', '网络相关', 'DNS 查询', 'safe', ['nslookup example.com'], [
    variant('查询域名', 'nslookup {domain}', '查询域名解析结果', { domain: '域名' }),
  ]),

  command('useradd', '用户管理', '添加用户', 'caution', ['useradd -m username'], [
    variant('创建用户和主目录', 'sudo useradd -m {user}', '需要 root 权限', { user: '用户名' }),
  ]),
  command('userdel', '用户管理', '删除用户', 'danger', ['userdel -r username'], [
    variant('删除用户和主目录', 'sudo userdel -r {user}', '会删除用户主目录，请确认备份', { user: '用户名' }),
  ]),
  command('passwd', '用户管理', '修改密码', 'caution', ['passwd username'], [
    variant('修改用户密码', 'sudo passwd {user}', '为指定用户设置新密码', { user: '用户名' }),
  ]),
  command('su', '用户管理', '切换用户', 'safe', ['su - username'], [
    variant('切换登录环境', 'su - {user}', '切换为指定用户并加载登录环境', { user: '用户名' }),
  ]),
  command('sudo', '用户管理', '以超级用户身份执行命令', 'caution', ['sudo command'], [
    variant('提权执行', 'sudo {command}', '以管理员权限执行命令', { command: '命令' }),
  ]),
  command('groupadd', '用户管理', '添加用户组', 'caution', ['groupadd groupname'], [
    variant('创建用户组', 'sudo groupadd {group}', '创建新的用户组', { group: '用户组名' }),
  ]),
  command('groupdel', '用户管理', '删除用户组', 'danger', ['groupdel groupname'], [
    variant('删除用户组', 'sudo groupdel {group}', '删除指定用户组', { group: '用户组名' }),
  ]),
  command('usermod', '用户管理', '修改用户属性', 'caution', ['usermod -aG groupname username'], [
    variant('追加到用户组', 'sudo usermod -aG {group} {user}', '将用户加入附加组', { group: '用户组名', user: '用户名' }),
  ]),

  command('apt', '软件包管理', 'Debian / Ubuntu 软件包管理', 'caution', ['sudo apt update', 'sudo apt install package', 'apt search keyword'], [
    variant('更新索引', 'sudo apt update', '更新软件包索引'),
    variant('升级软件包', 'sudo apt upgrade', '升级已安装软件包'),
    variant('安装软件包', 'sudo apt install {package}', '安装指定软件包', { package: '包名' }),
    variant('删除软件包', 'sudo apt remove {package}', '删除指定软件包', { package: '包名' }),
    variant('清理无用依赖', 'sudo apt autoremove', '清理不再需要的依赖包'),
    variant('搜索软件包', 'apt search {keyword}', '搜索软件包', { keyword: '关键词' }),
  ]),
  command('dnf', '软件包管理', 'Fedora / Red Hat 软件包管理', 'caution', ['sudo dnf check-update', 'sudo dnf install package', 'dnf search keyword'], [
    variant('检查更新', 'sudo dnf check-update', '检查可用更新'),
    variant('升级软件包', 'sudo dnf upgrade', '升级已安装软件包'),
    variant('安装软件包', 'sudo dnf install {package}', '安装指定软件包', { package: '包名' }),
    variant('删除软件包', 'sudo dnf remove {package}', '删除指定软件包', { package: '包名' }),
    variant('搜索软件包', 'dnf search {keyword}', '搜索软件包', { keyword: '关键词' }),
  ]),
  command('yum', '软件包管理', 'CentOS 旧版软件包管理', 'caution', ['sudo yum install package', 'yum search keyword'], [
    variant('安装软件包', 'sudo yum install {package}', '安装指定软件包', { package: '包名' }),
    variant('删除软件包', 'sudo yum remove {package}', '删除指定软件包', { package: '包名' }),
    variant('搜索软件包', 'yum search {keyword}', '搜索软件包', { keyword: '关键词' }),
  ]),

  command('mount', '磁盘挂载', '挂载文件系统', 'danger', ['mount /dev/sdb1 /mnt'], [
    variant('挂载分区', 'sudo mount {device} {mountPoint}', '将设备挂载到目录', { device: '设备路径，如 /dev/sdb1', mountPoint: '挂载点，如 /mnt' }),
  ]),
  command('umount', '磁盘挂载', '卸载文件系统', 'caution', ['umount /mnt'], [
    variant('卸载挂载点', 'sudo umount {mountPoint}', '卸载指定挂载点', { mountPoint: '挂载点' }),
  ]),
  command('fdisk', '磁盘挂载', '磁盘分区工具', 'danger', ['sudo fdisk -l', 'sudo fdisk /dev/sdb'], [
    variant('列出分区', 'sudo fdisk -l', '列出磁盘分区信息'),
    variant('编辑磁盘分区', 'sudo fdisk {device}', '进入交互式分区编辑，请谨慎', { device: '磁盘设备，如 /dev/sdb' }),
  ]),
  command('mkfs', '磁盘挂载', '创建文件系统', 'danger', ['mkfs.ext4 /dev/sdb1'], [
    variant('格式化为 ext4', 'sudo mkfs.ext4 {device}', '会清空目标分区数据', { device: '分区设备，如 /dev/sdb1' }),
  ]),
  command('fsck', '磁盘挂载', '文件系统检查修复', 'danger', ['fsck /dev/sda1'], [
    variant('检查修复分区', 'sudo fsck {device}', '通常应在未挂载状态下执行', { device: '分区设备' }),
  ]),
  command('dd', '磁盘挂载', '数据复制与转换', 'danger', ['dd if=/dev/sda of=/backup.img bs=4M'], [
    variant('制作磁盘镜像', 'sudo dd if={input} of={output} bs={blockSize} status=progress', '输入或输出写错可能造成严重数据损坏', { input: '输入设备或文件', output: '输出镜像文件', blockSize: '块大小，如 4M' }),
  ]),

  command('echo', 'Shell 操作', '输出文本', 'safe', ['echo $PATH', 'echo "hello"'], [
    variant('输出文本', 'echo "{text}"', '打印文本到标准输出', { text: '文本' }),
    variant('输出变量', 'echo ${variable}', '打印环境变量值', { variable: '变量名，如 PATH' }),
  ]),
  command('export', 'Shell 操作', '设置环境变量', 'safe', ['export VAR=value'], [
    variant('设置环境变量', 'export {name}={value}', '在当前 shell 中设置变量', { name: '变量名', value: '变量值' }),
  ]),
  command('alias', 'Shell 操作', '创建命令别名', 'safe', ["alias ll='ls -lh'"], [
    variant('创建别名', "alias {name}='{command}'", '为常用命令创建别名', { name: '别名', command: '命令内容' }),
  ]),
  command('unalias', 'Shell 操作', '删除命令别名', 'safe', ['unalias ll'], [
    variant('删除别名', 'unalias {name}', '移除指定别名', { name: '别名' }),
  ]),
  command('history', 'Shell 操作', '查看历史命令', 'safe', ['history', '!123'], [
    variant('查看历史', 'history', '列出历史命令'),
    variant('执行历史编号', '!{number}', '执行指定编号的历史命令', { number: '历史编号' }),
  ]),
  command('clear', 'Shell 操作', '清屏', 'safe', ['clear'], [
    variant('清空屏幕', 'clear', '清理终端显示'),
  ]),
  command('source', 'Shell 操作', '在当前 Shell 执行脚本', 'caution', ['source ~/.bashrc'], [
    variant('加载脚本', 'source {file}', '在当前 shell 中执行脚本', { file: '脚本路径' }),
  ]),
  command('which', 'Shell 操作', '定位命令路径', 'safe', ['which python'], [
    variant('查找命令路径', 'which {command}', '输出命令可执行文件路径', { command: '命令名' }),
  ]),
  command('whereis', 'Shell 操作', '定位命令相关文件', 'safe', ['whereis python'], [
    variant('查找相关路径', 'whereis {command}', '查找二进制、源码和手册页路径', { command: '命令名' }),
  ]),
  command('man', 'Shell 操作', '查看手册页', 'safe', ['man ls'], [
    variant('查看手册', 'man {command}', '打开命令手册页', { command: '命令名' }),
  ]),
  command('whatis', 'Shell 操作', '命令一行描述', 'safe', ['whatis ls'], [
    variant('查看一行说明', 'whatis {command}', '显示命令简短说明', { command: '命令名' }),
  ]),
];

function command(
  id: string,
  category: string,
  description: string,
  risk: RiskLevel,
  examples: string[],
  variants: CommandVariant[],
): CommandEntry {
  return { id, command: id, category, description, risk, examples, variants };
}

function variant(name: string, template: string, note: string, fields?: Record<string, string>): CommandVariant {
  return { name, template, note, fields };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getPlaceholders(template: string): string[] {
  const matches = template.matchAll(/\{([a-zA-Z][\w]*)\}/g);
  return Array.from(new Set(Array.from(matches, match => match[1])));
}

function riskText(risk: RiskLevel): string {
  if (risk === 'danger') return '高风险';
  if (risk === 'caution') return '需谨慎';
  return '常规';
}

function riskColor(risk: RiskLevel): string {
  if (risk === 'danger') return 'var(--color-error)';
  if (risk === 'caution') return 'var(--color-diff-mod-text)';
  return 'var(--color-success)';
}

function buildCommand(template: string, values: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z][\w]*)\}/g, (_, key: string) => values[key]?.trim() || `{${key}}`);
}

export default {
  id: 'linux-command-gen',
  name: 'Linux 命令生成器',
  icon: 'code',
  render(container: HTMLElement) {
    let activeCategory = '全部';
    let activeCommand = COMMANDS[0];
    let activeVariantIndex = 0;

    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/dev" class="tool-page-back">${icon('code')} 开发调试</a>
          <h1 style="font: var(--text-headline-md);">Linux 命令生成器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">按场景筛选命令，填写参数后生成可复制的 Linux 命令</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label" for="linux-command-search">搜索命令</label>
            <input id="linux-command-search" class="tool-input" placeholder="输入命令、用途或示例关键词，例如 grep、端口、权限" />
          </div>

          <div id="linux-category-filter" class="tool-actions" style="gap: 8px;"></div>

          <div class="linux-command-workspace" style="display: grid; grid-template-columns: minmax(260px, 0.8fr) minmax(360px, 1.2fr); gap: 16px; align-items: start;">
            <div class="tool-field">
              <label class="tool-label">命令列表 <span id="linux-command-count" style="font-weight: 400; color: var(--color-on-surface-variant);"></span></label>
              <div id="linux-command-list" style="display: grid; gap: 8px; max-height: 680px; overflow: auto; padding-right: 4px;"></div>
            </div>

            <div class="tool-field" style="min-width: 0;">
              <div id="linux-generator-panel" style="border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); background: var(--color-surface-container-lowest); padding: 18px; display: flex; flex-direction: column; gap: 16px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const searchInput = container.querySelector('#linux-command-search') as HTMLInputElement;
    const categoryFilter = container.querySelector('#linux-category-filter') as HTMLElement;
    const commandList = container.querySelector('#linux-command-list') as HTMLElement;
    const commandCount = container.querySelector('#linux-command-count') as HTMLElement;
    const generatorPanel = container.querySelector('#linux-generator-panel') as HTMLElement;

    function getFilteredCommands(): CommandEntry[] {
      const keyword = searchInput.value.trim().toLowerCase();
      return COMMANDS.filter(item => {
        const categoryMatched = activeCategory === '全部' || item.category === activeCategory;
        const text = [
          item.command,
          item.category,
          item.description,
          ...item.examples,
          ...item.variants.map(v => `${v.name} ${v.template} ${v.note}`),
        ].join(' ').toLowerCase();
        return categoryMatched && (!keyword || text.includes(keyword));
      });
    }

    function renderCategories() {
      const items = ['全部', ...CATEGORIES];
      categoryFilter.innerHTML = items.map(item => `
        <button class="btn ${item === activeCategory ? 'btn-primary' : 'btn-secondary'} linux-category-btn" data-category="${escapeHtml(item)}" style="padding: 8px 12px; cursor: pointer;">${escapeHtml(item)}</button>
      `).join('');
      categoryFilter.querySelectorAll('.linux-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeCategory = (btn as HTMLElement).dataset.category!;
          const filtered = getFilteredCommands();
          if (filtered.length) {
            activeCommand = filtered[0];
            activeVariantIndex = 0;
          }
          render();
        });
      });
    }

    function renderCommandList() {
      const filtered = getFilteredCommands();
      commandCount.textContent = `${filtered.length} 个`;
      if (!filtered.includes(activeCommand) && filtered.length) {
        activeCommand = filtered[0];
        activeVariantIndex = 0;
      }

      if (!filtered.length) {
        commandList.innerHTML = `
          <div style="padding: 16px; border: 1px dashed var(--color-outline-variant); border-radius: var(--radius-md); color: var(--color-on-surface-variant);">没有匹配命令</div>
        `;
        return;
      }

      commandList.innerHTML = filtered.map(item => {
        const selected = item.id === activeCommand.id;
        return `
          <button class="linux-command-item" data-id="${escapeHtml(item.id)}" style="
            width: 100%;
            text-align: left;
            cursor: pointer;
            border: 1px solid ${selected ? 'var(--color-primary)' : 'var(--color-outline-variant)'};
            background: ${selected ? 'var(--color-primary-container)' : 'var(--color-surface-container-lowest)'};
            color: var(--color-on-surface);
            border-radius: var(--radius-md);
            padding: 12px;
            transition: background var(--transition-fast), border-color var(--transition-fast);
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <code style="font-family: var(--font-mono); font-size: 15px; color: var(--color-primary);">${escapeHtml(item.command)}</code>
              <span style="font: var(--text-label-sm); color: ${riskColor(item.risk)};">${riskText(item.risk)}</span>
            </div>
            <div style="font: var(--text-body-sm); color: var(--color-on-surface-variant); margin-top: 4px;">${escapeHtml(item.description)}</div>
            <div style="font: var(--text-body-sm); color: var(--color-outline); margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(item.examples[0])}</div>
          </button>
        `;
      }).join('');

      commandList.querySelectorAll('.linux-command-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = (btn as HTMLElement).dataset.id!;
          const next = COMMANDS.find(item => item.id === id);
          if (!next) return;
          activeCommand = next;
          activeVariantIndex = 0;
          render();
        });
      });
    }

    function renderGenerator() {
      const selectedVariant = activeCommand.variants[activeVariantIndex] ?? activeCommand.variants[0];
      const placeholders = getPlaceholders(selectedVariant.template);
      const fieldHtml = placeholders.length
        ? placeholders.map(name => `
          <div class="tool-field">
            <label class="tool-label" for="linux-field-${escapeHtml(name)}">${escapeHtml(selectedVariant.fields?.[name] ?? name)}</label>
            <input id="linux-field-${escapeHtml(name)}" class="tool-input linux-param" data-name="${escapeHtml(name)}" value="${escapeHtml(defaultValueFor(name))}" />
          </div>
        `).join('')
        : '<div style="font: var(--text-body-md); color: var(--color-on-surface-variant);">这个变体不需要额外参数。</div>';

      generatorPanel.innerHTML = `
        <div style="display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <h2 style="margin: 0; font: var(--text-headline-sm);">${escapeHtml(activeCommand.command)}</h2>
              <span style="font: var(--text-label-sm); color: ${riskColor(activeCommand.risk)}; border: 1px solid currentColor; border-radius: var(--radius-sm); padding: 2px 8px;">${riskText(activeCommand.risk)}</span>
            </div>
            <p style="margin: 6px 0 0; color: var(--color-on-surface-variant); font: var(--text-body-md);">${escapeHtml(activeCommand.description)}</p>
          </div>
          <span style="font: var(--text-label-sm); color: var(--color-outline);">${escapeHtml(activeCommand.category)}</span>
        </div>

        <div class="tool-field">
          <label class="tool-label" for="linux-variant-select">命令变体</label>
          <select id="linux-variant-select" class="tool-select">
            ${activeCommand.variants.map((item, index) => `<option value="${index}" ${index === activeVariantIndex ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}
          </select>
          <div style="font: var(--text-body-sm); color: var(--color-on-surface-variant);">${escapeHtml(selectedVariant.note)}</div>
        </div>

        <div id="linux-param-grid" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">
          ${fieldHtml}
        </div>

        <div class="tool-field">
          <label class="tool-label">生成命令</label>
          <pre id="linux-command-output" class="tool-output" style="margin: 0; min-height: 52px; white-space: pre-wrap; word-break: break-all;"></pre>
          <div class="tool-actions">
            <button id="linux-copy-command" class="btn btn-primary" style="cursor: pointer;">${icon('clipboard')} 复制命令</button>
            <button id="linux-reset-fields" class="btn btn-ghost" style="cursor: pointer;">${icon('refresh')} 重置参数</button>
          </div>
        </div>

        <div class="tool-field">
          <label class="tool-label">当前命令示例</label>
          <div id="linux-example-list" style="display: grid; gap: 8px;">
            ${activeCommand.examples.map(example => `
              <button class="linux-example-btn" data-example="${escapeHtml(example)}" style="
                text-align: left;
                cursor: pointer;
                border: 1px solid var(--color-outline-variant);
                border-radius: var(--radius-md);
                background: var(--color-surface-container-low);
                color: var(--color-on-surface);
                padding: 10px 12px;
                font-family: var(--font-mono);
                word-break: break-all;
              ">${escapeHtml(example)}</button>
            `).join('')}
          </div>
        </div>

        ${activeCommand.risk === 'danger' ? `
          <div style="border: 1px solid var(--color-error); border-radius: var(--radius-md); padding: 12px; color: var(--color-error); background: var(--color-error-container); font: var(--text-body-md);">
            高风险命令可能删除数据、终止进程或改写磁盘。执行前请确认目标路径、设备名和备份。
          </div>
        ` : ''}
      `;

      const variantSelect = generatorPanel.querySelector('#linux-variant-select') as HTMLSelectElement;
      const output = generatorPanel.querySelector('#linux-command-output') as HTMLElement;

      function updateOutput() {
        const values: Record<string, string> = {};
        generatorPanel.querySelectorAll<HTMLInputElement>('.linux-param').forEach(input => {
          values[input.dataset.name!] = input.value;
        });
        output.textContent = buildCommand(selectedVariant.template, values);
      }

      variantSelect.addEventListener('change', () => {
        activeVariantIndex = Number(variantSelect.value);
        renderGenerator();
      });

      generatorPanel.querySelectorAll<HTMLInputElement>('.linux-param').forEach(input => {
        input.addEventListener('input', updateOutput);
      });

      generatorPanel.querySelector('#linux-copy-command')!.addEventListener('click', () => {
        navigator.clipboard.writeText(output.textContent ?? '');
        showToast('命令已复制');
      });

      generatorPanel.querySelector('#linux-reset-fields')!.addEventListener('click', () => {
        renderGenerator();
      });

      generatorPanel.querySelectorAll('.linux-example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const example = (btn as HTMLElement).dataset.example ?? '';
          navigator.clipboard.writeText(example);
          showToast('示例已复制');
        });
      });

      updateOutput();
    }

    function defaultValueFor(name: string): string {
      const defaults: Record<string, string> = {
        path: '.',
        dir: 'example-dir',
        file: 'file.txt',
        files: 'file1.txt file2.txt',
        target: 'target',
        source: 'source',
        pattern: '*.log',
        keyword: 'error',
        lines: '20',
        old: 'old',
        new: 'new',
        delimiter: ':',
        field: '1',
        fields: '$1',
        separator: ':',
        text: 'hello',
        chars: 'a',
        left: 'file1.txt',
        right: 'file2.txt',
        patchFile: 'file.patch',
        mode: '755',
        owner: 'user',
        group: 'group',
        mask: '022',
        archive: 'archive.tar.gz',
        pid: '1234',
        name: 'll',
        level: '10',
        command: 'command',
        job: '1',
        user: 'user',
        host: 'example.com',
        count: '4',
        device: 'eth0',
        url: 'https://example.com/file',
        port: '22',
        remotePath: '/path',
        domain: 'example.com',
        package: 'package',
        mountPoint: '/mnt',
        input: '/dev/sda',
        output: '/backup.img',
        blockSize: '4M',
        variable: 'PATH',
        value: 'value',
        number: '123',
      };
      return defaults[name] ?? name;
    }

    function render() {
      renderCategories();
      renderCommandList();
      renderGenerator();
    }

    searchInput.addEventListener('input', () => {
      const filtered = getFilteredCommands();
      if (filtered.length) {
        activeCommand = filtered[0];
        activeVariantIndex = 0;
      }
      renderCommandList();
      renderGenerator();
    });

    render();

    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 980px) {
        .linux-command-workspace {
          grid-template-columns: 1fr !important;
        }
      }

      @media (max-width: 640px) {
        #linux-param-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    container.appendChild(style);
  },
};
