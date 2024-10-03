
const HeaderTemplate = require('./header')
const FooterTemplate = require('./footer')
const headerTemplate = new HeaderTemplate()
const footerTemplate = new FooterTemplate()

class RegisterTemplate {
    
    html() {
        const header = headerTemplate.html()
        const footer = footerTemplate.html()

        return `${header}

        <!-- Title -->
        <tr>
            <td>
                <table class=t8 role=presentation cellpadding=0 cellspacing=0 align=center>
                    <tr>
                        <!--[if !mso]><!-->
                        <td class=t7 style="width:315px;">
                            <!--<![endif]-->
                            <!--[if mso]><td class=t7 style="width:315px;"><![endif]-->
                            <h1 class=t5 style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:36px;font-weight:700;font-style:normal;font-size:40px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">
                                Bienvenido
                            </h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <div class=t9 style="mso-line-height-rule:exactly;mso-line-height-alt:30px;line-height:30px;font-size:1px;display:block;">&nbsp;</div>
            </td>
        </tr>
        <tr>
            <td>
                <table class=t12 role=presentation cellpadding=0 cellspacing=0 align=center>
                    <tr>
                        <!--[if !mso]><!-->
                        <td class=t11 style="width:350px;">
                            <!--<![endif]-->
                            <!--[if mso]><td class=t11 style="width:350px;"><![endif]-->
                            <p class=t10 style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:500;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;direction:ltr;color:#666666;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">
                                Nos emociona tenerte aquí. Juntos, llevaremos tu servicio a un nivel superior.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <div class=t14 style="mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block;">&nbsp;</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class=t21 style="mso-line-height-rule:exactly;mso-line-height-alt:125px;line-height:125px;font-size:1px;display:block;">&nbsp;</div>
            </td>
        </tr>
    </table>
</td>
</tr>
</table>
</div>
<!--[if mso]>
</td>
</tr>
</table>
<![endif]-->
</div>
</td>
</tr>
</table>
</td>
</tr>

        ${footer}`
    }

}

module.exports = RegisterTemplate;
