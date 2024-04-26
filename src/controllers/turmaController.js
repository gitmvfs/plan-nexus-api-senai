function verTodosCursos(sequelize){
    return new Promise(async(resolve, reject) => {
        
        try {
            sequelize.query("select * from todos_cursos order by nome")
            .then((r) => console.log(r))
            .catch((e) => reject(e))
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { verTodosCursos }