module.exports = {
    cmd: "```md\n# {cmd} 명령어 오류:\n* 서버: {server.name} / {server.id}\n* 사용자: {author.tag} / {author.id}\n* 명령어: {cmd.content}\n* 오류: {err}\n* 사용일: {at}\n```",
    db: "```md\n# {collection} 컬렉션에서 오류:\n* 서버: {server.name} / {server.id}\n* 사용자: {author.tag} / {author.id}\n* 명령어: {cmd.content}\n* 오류: {err}\n* 사용일: {at}\n```"
}
