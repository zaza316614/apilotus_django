import re
from django import forms

from loci.models import Place


class PlaceForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):

        super(PlaceForm, self).__init__(*args, **kwargs)
        required_fields = ('state', 'zip_code',)
        for f in required_fields:
            self.fields[f].required = True

    def clean_zip_code(self):

        pattern = re.compile(r'^\d{5}(?:-\d{4})?$')
        zip_code = self.cleaned_data.get('zip_code', '')

        if not pattern.match(zip_code):
            raise forms.ValidationError(
                'Enter a zip code in the format XXXXX or XXXXX-XXXX.'
            )

        return zip_code

    class Meta:
        model = Place
        fields = [
            "name",
            "address",
            "city",
            "state",
            "zip_code"
        ]


class GeolocationForm(forms.Form):
    geo = forms.CharField(label='Location')


class GeolocationDistanceForm(GeolocationForm):
    dist = forms.ChoiceField(
        choices=[(m, '%s miles' % m) for m in [5, 10, 20, 40, 80, 160, 240]],
        initial=160,
        label='Distance'
    )


def geo_form_for_place(place):
    return GeolocationForm(initial={'geo': place.zip_code})


def geodist_form_for_place(request_place):
    return GeolocationDistanceForm(initial={
        'geo': request_place.zip_code, 'dist': request_place.nearby_distance})
