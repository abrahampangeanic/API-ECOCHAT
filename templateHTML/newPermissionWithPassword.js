
const HeaderTemplate = require('./header')
const FooterTemplate = require('./footer')
const headerTemplate = new HeaderTemplate()
const footerTemplate = new FooterTemplate()

class PermissionWithPasswordTemplate {
    

    html(email, password) {
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
                            <h1 class=t5 style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:40px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">
                                Bienvenido a TaxRepo
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
                                Su asesor le creado una cuenta y asignado una contraseña temporal la cual puede cambiar en su perfil
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
                <div class=t17 style="mso-line-height-rule:exactly;mso-line-height-alt:60px;line-height:60px;font-size:1px;display:block;">&nbsp;</div>
            </td>
        </tr>
        <tr>
            <td>
                <table class=t20 role=presentation cellpadding=0 cellspacing=0 align=center>
                    <tr>
                        <!--[if !mso]><!-->
                        <td class=t19 style="width:350px;">
                            <!--<![endif]-->
                            <!--[if mso]><td class=t19 style="width:350px;"><![endif]-->
                            <p class=t18 style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:25px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#BBBBBB;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">
                                Usuario: <span style="font-weight:600"> ${email} </span>
                            </p>
                            <p class=t18 style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:25px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#BBBBBB;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">
                                Contraseña: <span style="font-weight:600"> ${password} </span>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <div class=t17 style="mso-line-height-rule:exactly;mso-line-height-alt:60px;line-height:60px;font-size:1px;display:block;">&nbsp;</div>
            </td>
        </tr>
        <tr>
            <td>
                <table class=t16 role=presentation cellpadding=0 cellspacing=0 align=center>
                    <tr>
                        <!--[if !mso]><!-->
                        <td class=t15 style="background-color:#96A870;overflow:hidden;width:308px;text-align:center;line-height:58px;mso-line-height-rule:exactly;mso-text-raise:11px;border-radius:14px 14px 14px 14px;">
                            <!--<![endif]-->
                            <!--[if mso]><td class=t15 style="background-color:#96A870;overflow:hidden;width:308px;text-align:center;line-height:58px;mso-line-height-rule:exactly;mso-text-raise:11px;border-radius:14px 14px 14px 14px;"><![endif]-->
                            <a class=t13 href="https://app.taxrepo.com" style="display:block;margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:58px;font-weight:600;font-style:normal;font-size:21px;text-decoration:none;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:11px;" target=_blank>
                            Ir Taxrepo App
                            </a>
                        </td>
                    </tr>
                </table>
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

module.exports = PermissionWithPasswordTemplate;
