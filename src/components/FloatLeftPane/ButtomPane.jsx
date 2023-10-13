import React from 'react'
import styles from './index.module.less'
const list1 = [
  { title: "X" ,value:"42"},
  { title: "y" ,value:"62"},
  { title: "z" ,value:"85"},
  { title: "rotx",value:"412" },
  { title: "roty",value:"323" },
  { title: "rotz",value:"242" },
  { title: "vx" ,value:"62"},
  { title: "vy" ,value:"44"},
  { title: "vz" ,value:"12"},
  { title: "wx" ,value:"13"},
  { title: "wy",value:"02" },
  { title: "wz",value:"33" },
]
const ListTable = ({ list }) => {
  return <div className={styles.listTable}>
    {
      list.map(o => {
        return <div key={o.title} className={styles.listItem}>
          <div className={styles.title}>
            {o.title}
          </div>
          <div className={styles.val}>
          {o.value}
          </div>
        </div>
      })
    }

  </div>

}

export default function ButtomPane() {
  return (
    <div className={styles.ButtomPane}>
      实时状态
      <ListTable list={list1}></ListTable>
    </div>
  )
}
