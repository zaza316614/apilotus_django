jQuery(document).ready(function(t) {
    function get_selected_crm() {
        if (t(".crm_dropdown_list").length > 0) {
            crm_id = t(".crm_dropdown_list").prop("id");
            crm_name = t(".crm_dropdown_list").html();
        }
    }

    function show_alert(e) {
        t(".retention_alert").html(e);
        t(".retention_alert").fadeIn(1e3, function() {
            t(".retention_alert").fadeOut(3e3)
        });
    }

    function show_waiting(e, a) {
        "list" === e && (a ? t(".retention_waiting").html(loading_gif) : t(".retention_waiting").html(""))
    }

    function set_dates() {
        t("#from_date").prop("disabled", true);
        t("#to_date").prop("disabled", true);
        let cur_date = new Date;
        let formatted_date = format_date(cur_date.getFullYear(), cur_date.getMonth() + 1, cur_date.getDate());
        if ("date_today" == date_type) {
            from_date = formatted_date;
            to_date = formatted_date;
        }
        else if ("date_yesterday" == date_type) {
            cur_date.setDate(cur_date.getDate() - 1);
            from_date = format_date(cur_date.getFullYear(), cur_date.getMonth() + 1, cur_date.getDate());
            to_date = format_date(cur_date.getFullYear(), cur_date.getMonth() + 1, cur_date.getDate());
        }
        else if ("date_thisweek" === date_type) {
            let r = cur_date.getDate() + 1;
            0 == cur_date.getDay() ? r -= 7 : r -= cur_date.getDay();
            cur_date.setDate(r);
            from_date = format_date(cur_date.getFullYear(), cur_date.getMonth() + 1, cur_date.getDate());
            to_date = formatted_date;
        } else if ("date_thismonth" == date_type) {
            from_date = format_date(cur_date.getFullYear(), cur_date.getMonth() + 1, 1);
            to_date = formatted_date;
        }
        else if ("date_thisyear" == date_type) {
            from_date = format_date(cur_date.getFullYear(), 1, 1);
            to_date = formatted_date;
        }
        else if ("date_lastweek" == date_type) {
            let r = cur_date.getDate() + 1 - 7;
            0 == cur_date.getDay() ? r -= 7 : r -= cur_date.getDay();
            cur_date.setDate(r);
            from_date = format_date(cur_date.getFullYear(), cur_date.getMonth() + 1, cur_date.getDate());
            r = cur_date.getDate() + 6;
            cur_date.setDate(r);
            to_date = format_date(cur_date.getFullYear(), cur_date.getMonth() + 1, cur_date.getDate());
        } else if ("date_custom" == date_type) {
            from_date = "";
            to_date = "";
            t("#from_date").prop("disabled", false);
            t("#to_date").prop("disabled", false);
        }
        t("#from_date").val(from_date);
        t("#to_date").val(to_date);
    }

    function format_date(year, month, date) {
        if (month < 10) month = "0" + month;
        if (date < 10) date = "0" + date;
        return month + "/" + date + "/" + year;
    }

    function get_initial_report() {
        if ("" == t("#from_date").val()) {
            show_alert("Please select FROM DATE.");
        }
        else if ("" == t("#to_date").val()) {
            show_alert("Please select TO DATE.");
        }
        else {
            show_waiting("list", !0);
            t.ajax({
                type: "GET",
                url: "/admin/ajax_initial_list",
                data: {
                    crm_id: crm_id,
                    from_date: t("#from_date").val(),
                    to_date: t("#to_date").val()
                },
                success: function(response) {
                    show_waiting("list", !1);
                    let data = jQuery.parseJSON(response.replace(new RegExp("'", 'g'), '"'));
                    let total_length = data.length;

                    if (0 === total_length)
                        return void show_alert("There is no initial information.");

                    let result_html = "";
                    for (let i = 0; i < total_length; i++) {
                        let campaign = data[i][0];

                        result_html += '<tr id="camprow_' + campaign[0] + '" class="camp_tr">';
                        if (-1 === campaign[0]) {
                            result_html += "<td></td>";
                            result_html += "<td></td>";
                            result_html += "<td><b>" + "Total" + "</b></td>";
                        }
                        else {
                            result_html += '<td>' + minus_sign + '</td>';
                            result_html += "<td></td>";
                            result_html += "<td>(" + campaign[0] + ") " + campaign[1] + "</td>";
                        }
                        result_html += '<td style="border-left: 1px solid #dadada">' + campaign[2] + "</td>";
                        result_html += "<td>" + campaign[3] + "</td>";
                        let color = campaign[4] < 60.0 ? 'yellow': 'green';
                        result_html += '<td style="background-color: ' + color + '"><b>' + campaign[4] + '%</b></td>';
                        result_html += "</tr>";

                        let affiliates = data[i][1];
                        for (let affiliate_id = 0; affiliate_id < affiliates.length; affiliate_id++) {
                            let affiliate = affiliates[affiliate_id][0];

                            let a = '<tr id="affrow_' + campaign[0] + "_" + affiliate[0] + '" class="aff_item_by_' + campaign[0] + '">';
                            a += '<td style="border-top:none"></td>';
                            a += '<td id="affmark_' + campaign[0] + "_" + affiliate[0] + '">' + triangle_sign + "</td>";
                            a += "<td>(" + affiliate[0] + ") " + affiliate[1] + "</td>";
                            a += '<td style="border-left: 1px solid #dadada">' + affiliate[2] + "</td>";
                            a += "<td>" + affiliate[3] + "</td>";
                            color = affiliate[4] < 60.0 ? 'yellow': 'green';
                            a += '<td style="background-color: ' + color + '">' + affiliate[4] + '%</td>';
                            a += "</tr>";
                            result_html += a;

                            let sub_affiliates = affiliates[affiliate_id][1];
                            sub_affiliates.length > 0 && 0 === affiliate_id && t("#affrow_" + campaign[0] + "_" + affiliate[0]).css("border-bottom", "none");
                            for (let sub_affiliate_id = 0; sub_affiliate_id < sub_affiliates.length; sub_affiliate_id++) {
                                let sub_affiliate = sub_affiliates[sub_affiliate_id];

                                let o = '<tr id="subaff_' + sub_affiliate[0] + '" class="subaff_item_by_' + campaign[0] + " esubaff_" + campaign[0] + "_" + affiliate[0] + '">';
                                o += '<td style="border-top:none"></td>';
                                o += '<td style="border-top:none"></td>';
                                o += "<td>(" + sub_affiliate[0] + ") " + sub_affiliate[1] + "</td>";
                                o += '<td style="border-left: 1px solid #dadada">' + sub_affiliate[2] + "</td>";
                                o += "<td>" + sub_affiliate[3] + "</td>";
                                color = sub_affiliate[4] < 60.0 ? 'yellow': 'green';
                                o += '<td style="background-color: ' + color + '">' + sub_affiliate[4] + '%</td>';
                                o += "</tr>";
                                result_html += o;
                            }
                        }
                    }
                    t(".table_retention_body").html(result_html);
                },
                failure: function() {
                    show_waiting("list", !1);
                    show_alert("Cannot load initial information.");
                }
            })
        }
    }

    let loading_gif = '<img src="/static/images/loading.gif" style="width: 22px; height: 22px;">';
    let minus_sign = '<span class="glyphicon glyphicon-minus-sign" aria-hidden="true" style="color: #ffa5a5"></span>';
    let triangle_sign = '<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true" style="color: #ffa5a5"></span>';
    let crm_id = -1;
    let crm_name = "";
    let date_type = "date_thisweek";
    let from_date = "";
    let to_date = "";

    get_selected_crm();
    set_dates();
    get_initial_report();

    t(".crm_dropdown_menu li").on("click", function(e) {
        crm_name = t(this).text();
        crm_id = t(this).find("a").attr("id");
        t(".crm_toggle_button").html(crm_name + ' <span class="caret"></span>');
    });
    t(".input-daterange").datepicker({});
    t(".date_dropdown_menu li").on("click", function(e) {
        let r = t(this).text();
        date_type = t(this).find("a").attr("id");
        t(".date_toggle_button").html(r + ' <span class="caret"></span>');
        set_dates();
    });
    t(".btn_export_quick").click(function() {
        let e = "./export_quick_initial.php?from_date=" + t("#from_date").val() + "&to_date=" + t("#to_date").val() + "&crm_id=" + crm_id + "&crm_name=" + crm_name;
        window.location.href = e
    });
    t(".btn_export_full").click(function() {
        let e = "./export_full_initial.php?from_date=" + t("#from_date").val() + "&to_date=" + t("#to_date").val();
        window.location.href = e
    });
    t(".retention_search_button").click(function() {
        get_initial_report();
    });
});
